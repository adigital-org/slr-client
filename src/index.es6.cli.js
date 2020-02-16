/*
  SLR-Client CLI main ES6 file
 */

import './cli/window'
import setupMaster from './cli/master'
import setupWorker from './cli/worker'
import cluster from 'cluster'

if (cluster.isMaster) {
  setupMaster().catch((e) => {throw new Error("Fatal error: " + e)})
} else if (cluster.isWorker) {
  setupWorker()
} else throw new Error('Unknown process type')