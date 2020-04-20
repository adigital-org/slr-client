/*
  SLR-Client CLI config adapter
 */

import config from '../config'
import packageJson from '../../package.json'
import params from './params.cli'

config.maxParallel = params.threadsPerWorker // Max parallel per worker
config.maxRps = Math.floor(params.maxRps/params.coresToUse) // Max RPS per worker
config.workingUiUpdateInterval = 1000
config.messages.appVersion = packageJson.version
config.downloadingTimeout = 0
if (params.customApi) config.apiDomain = params.customApi

export default config