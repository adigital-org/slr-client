/*
  SLR-Client CLI arguments parser
 */

import { basename, dirname } from 'path'
import { channels } from '../util/SLRUtils'
import clientDefaultConfig from '../config'
import packageJson from '../../package.json'
import { cpus } from 'os'

const params = {
  key: '',
  secret: '',
  inputCsv: '',
  outputFolder: '',
  threadsPerWorker: 1,
  maxThreadsPerWorker: 200,
  channel: '',
  totalRecords: -1,
  linesPerTask: 40000,
  maxRps: 2000,
  cliMaxRps: 6000,
  coresToUse: cpus().length,
  checkUpdates: true
}

const channelOptions = Object.keys(channels)

const help = [
  ['Usage:'],
  ['  Required params: inputCsv=/path/to/file.csv outputFolder=/path/to/output/folder/ channel=ChannelName key=AKIAX...X secret=xx...xx'],
  ['  Channel options: ' + channelOptions.join(',')],
  ['  ADVANCED params: linesPerTask=(number) maxRps=(number) maxCoresToUse=(number) disableCheckUpdates'],
  ['Documentation, updates and source code: ' + clientDefaultConfig.slrClientDistUrl],
  [`${packageJson.name} for servers v.${packageJson.version} by ${packageJson.author}\n`]
]

const showHelp = () => {
  process.stdout.write(help.join('\n'))
  process.exit(0)
}

const err = (msg) => { // Simple usage explanation
  process.stderr.write(msg + '\n')
  process.stderr.write(help.join('\n'))
  process.exit(1)
}

const isValidChannel = (channel) => {
  return channelOptions.indexOf(channel) > -1
}

const checkParams = (params) => {
  if (params.key === '') err('ERROR: Missing key')
  if (params.secret === '') err('ERROR: Missing secret')
  if (params.inputCsv === '') err('ERROR: Missing inputCsv')
  if (params.outputFolder === '') err('ERROR: Missing outputFolder')
  if (params.channel === '' || !isValidChannel(params.channel)) err('ERROR: Missing or wrong channel option')
  return params
}

const args = process.argv.slice(2)
if (args.length === 0 || (args.length === 1 && args[0] === 'help')) showHelp()
for (const arg of args) {
  const param = arg.split('=')
  const type = param[0]
  const value = param[1]

  try {
    switch(type) {
      case 'key':
        if (value.length > 0) params.key = value
        break
      case 'secret':
        if (value.length > 0) params.secret = value
        break
      case 'inputCsv':
        if (value.length > 0) params.inputCsv = new File([], basename(value), dirname(value))
        break
      case 'outputFolder':
        if (value.length > 0) params.outputFolder = value
        break
      case 'channel':
        if (value.length > 0) params.channel = value
        break
      case 'linesPerTask': // (parseInt() can return NaN. if NaN or 0, set default)
        if (value.length > 0) params.linesPerTask = parseInt(value) || params.linesPerTask
        break
      case 'maxRps': // Limit max RPS to cliMaxRps. (parseInt() can return NaN. if NaN or 0, set default)
        if (value.length > 0) params.maxRps = Math.min(params.cliMaxRps, parseInt(value)) || params.maxRps
        break
      case 'maxCoresToUse': // Limit max cores to use. (parseInt() can return NaN. if NaN or 0, set default)
        if (value.length > 0) params.coresToUse = Math.min(params.coresToUse, parseInt(value)) || params.coresToUse
        break
      case "disableCheckUpdates":
        params.checkUpdates = false
        break
      default:
        err(`ERROR: unknown argument '${type}'`)
    }
  } catch(e) {
    err('ERROR: ' + e.message)
  }
}

const totalThreads = Math.ceil(params.maxRps/clientDefaultConfig.hashesPerRequest)
if (totalThreads < params.coresToUse) {
  params.coresToUse = totalThreads
  params.threadsPerWorker = 1
} else {
  // Too many threads per core/cpu can reduce performance
  const tpw = Math.floor(totalThreads/params.coresToUse)
  params.threadsPerWorker = tpw > params.maxThreadsPerWorker ? params.maxThreadsPerWorker : tpw
}

export default checkParams(params)