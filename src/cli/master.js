/*
  SLR-Client CLI Node cluster master
 */

import readLines, { countLines } from '../util/FileLineGenerator'
import cluster from 'cluster'
import * as fs from 'fs'
import HugeFile from '../util/HugeFile'
import params from './params.cli'
import config from './config.cli'
import ConsolidatedProgress from '../util/cli/ConsolidatedProgress'
import Report from '../util/cli/Report'
import packageJson from '../../package.json'
import IntegrityChecker from "../util/IntegrityChecker";

let lineGenerator, success, fail, consolidatedProgress, report, reportTimer, status
let tasks = 0
const workerParams = {
  id: null,
  inputCsv: null,
  channel: null,
  totalRecords: -1,
  config: null,
  credentials: { key: null, secret: null },
  lines: []
}
const workers = []

const workerReport = (workerMsg) => {
  const { type, payload } = workerMsg.message
  switch(type) {
    case 'session/start':
      break
    case 'session/progress':
      consolidatedProgress.setStats(workerMsg.taskId, payload.stats)
      break
    case 'session/done':
      consolidatedProgress.setStats(workerMsg.taskId, payload.stats)
      success.set(payload.results.success.plain, payload.stats.found + payload.stats.notFound)
      fail.set(payload.results.fail.plain, payload.stats.error)

      if (payload.stats.error > 0) {
        report.printError(`WARNING: Got ${payload.stats.error} error(s). Reducing concurrency.`)
        config.maxParallel = config.maxParallel-Math.ceil(payload.stats.error/params.coresToUse)
      }

      taskToWorker(workers[workerMsg.workerId-1], workerParams, params.linesPerTask)
        .catch((e) => finish(5, 'Fatal error feeding worker: ' + e))
      break
  }
}

const taskToWorker = async (worker, workerParams, lines) => {
  // Buffer some lines to send to the worker and setup worker params
  workerParams.lines = await requestLines(lineGenerator, lines)
  workerParams.totalRecords = workerParams.lines.length
  workerParams.id = tasks++

  worker.send(workerParams)
}

const requestLines = async (lineGenerator, numberOfLines) => {
  const lines = []
  for (let l = 0; l < numberOfLines; l++) {
    const { value, done } = await lineGenerator.next()
    if (done) break
    lines.push(value)
  }
  return lines
}

const finishFile = async (hugeFile) => {
  try {
    await hugeFile.save(new IntegrityChecker(hugeFile.totalRecords), params.outputFolder)
    hugeFile.delete()
    return true
  } catch (e) {
    report.printError(`ERROR: error saving "${hugeFile.taggedFileName}" file: ${e}`)
    return false
  }
}

const finish = async (code, errMsg) => {
  try {
    status = 'saving-and-verifying-output'
    if (params.totalRecords !== success.totalRecords + fail.totalRecords && code === 0) {
      code = 7
      report.printError(
        `ERROR: the number of processed records does not match the detected ones. Check output files and log.`
      )
    }
    if (errMsg) process.stderr.write(errMsg + '\n')

    if (success) if (!await finishFile(success) && code === 0) code = 6
    if (fail) if (!await finishFile(fail) && code === 0) code = 6

    clearInterval(reportTimer)
    report.printEnd(code)
    process.exit(code)
  } catch(e) {
    process.stderr.write('\nError cleaning session. Some results may have been lost. Error:' + e)
    process.exit(1)
  }
}

const killWorkers = () => {
  for (let w of workers) w.process.kill()
}

const workerEnd = (worker, code, signal) => {
  if (code !== 0 || signal) {
    const errMsg =
      "Fatal error (" + (signal || code) + "): a child process ended with errors. " +
      "Try again reducing current linesPerTask ("+ params.linesPerTask + ") or " +
      "current number of cores to use (" + params.coresToUse + ")."
    killWorkers()
    finish(2, errMsg)
  } else {
    // Workers exit with 0 code when there are no more tasks
    let alive = 0
    for (let w of workers) {
      if (!w.isDead()) alive++
    }
    if (alive === 0) {
      killWorkers()
      finish(0)
    }
  }
}

const setupMaster = async () => {
  //Setup master
  lineGenerator = readLines(params.inputCsv)

  workerParams.inputCsv = params.inputCsv
  workerParams.channel = params.channel
  workerParams.credentials = { key: params.key, secret: params.secret }
  workerParams.config = config

  consolidatedProgress = new ConsolidatedProgress(params.totalRecords)
  status = 'initializing'
  report = new Report(consolidatedProgress, params.checkUpdates, config.latestVersionCheckUrl, packageJson.version)
  reportTimer = setInterval(() => report.printProgress(status), config.workingUiUpdateInterval)

  try { params.totalRecords = await countLines(params.inputCsv) }
  catch(e) { await finish(3, e.message) }
  consolidatedProgress.updateTotalRecords(params.totalRecords)

  if (params.totalRecords < params.linesPerTask*params.coresToUse)
    params.linesPerTask = Math.ceil(params.totalRecords/params.coresToUse)

  process.on("SIGINT", () => {
    cluster.off('exit', workerEnd)
    killWorkers()
    finish(1)
  })
  cluster.on('exit', workerEnd)

  fs.mkdirSync(params.outputFolder, {recursive: true})
  success = new HugeFile(params.inputCsv.name, '_slr-client-success_', 0, fs, params.outputFolder)
  fail = new HugeFile(params.inputCsv.name, '_slr-client-error_', 0, fs, params.outputFolder)

  //Create workers and send tasks
  for (let i = 0; i < params.coresToUse; i++)
    workers.push(cluster.fork({proxy: params.proxy, protocol: config.apiProtocol}))
  for (let w of workers) {
    await taskToWorker(w, workerParams, params.linesPerTask)
      .catch((e) => finish(4, 'Fatal error feeding worker for the first time: ' + e))
    w.on('message', (msg) => {
      workerReport(msg)
    })
  }

  status = 'working'
}

export default setupMaster