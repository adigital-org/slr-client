/*
  SLR-Client CLI Node cluster worker
 */

import { startRequests } from "../util/Requester"
import cluster from 'cluster'
import https from 'https'
import http from 'http'
import httpsProxyAgent from 'https-proxy-agent'
import httpProxyAgent from 'http-proxy-agent'
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
    agent
  ).catch((e) => {throw new Error(e)})
}

const setupWorker = (protocol, proxy) => {
  // If HTTP/S proxy is required, use http/s-proxy-agent module,
  // otherwise use NodeJS native HTTP/S agent.
  if (protocol === 'http') agent = proxy ? new httpProxyAgent(proxy) : new http.Agent({keepAlive: true})
  else agent = proxy ? new httpsProxyAgent(proxy) : new https.Agent({keepAlive: true})

  process.on('message', (task) => {
    if (task.totalRecords === 0) process.exit(0)
    work(task)
  })
}

export default setupWorker