/*
  SLR-Client CLI Node cluster worker
 */

import { startRequests } from "../util/Requester"
import cluster from 'cluster'
import https from 'https'
import HugeFile from '../util/HugeFile'

let agent = null

const progress = (taskId, status) => {
  process.send({workerId: cluster.worker.id, taskId, message: status })
}

function* lineGenerator(lines) {
  for (let line of lines) {
    yield line
  }
}

const work = (task) => {
  const bufferFiles= {
    success: new HugeFile(task.inputCsv.name, '',0),
    fail: new HugeFile(task.inputCsv.name, '',0)
  }
  startRequests(
    bufferFiles,
    task.channel,
    task.totalRecords,
    task.config,
    task.credentials,
    lineGenerator(task.lines),
    (status) => progress(task.id, status),
    (task.config.useKeepAlive) ? agent: null
  ).catch((e) => {throw new Error(e)})
}

const setupWorker = () => {
  agent = new https.Agent({keepAlive: true})
  process.on('message', (task) => {
    if (task.totalRecords === 0) process.exit(0)
    work(task)
  })
}

export default setupWorker