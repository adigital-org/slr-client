/*
  SLR-Client CLI window adapter
 */

import File from '../util/cli/File'
import FileReader from '../util/cli/FileReader'
import fetch from 'node-fetch'

global.File = File
global.FileReader = FileReader
global.fetch = fetch
global.window = {}
global.window.clearInterval = global.clearInterval
global.window.clearTimeout = global.clearTimeout
global.window.setInterval = global.setInterval
global.window.setTimeout = global.setTimeout