import Config from '../../config'
import { startRequests } from '../../util/Requester'
import readLines from '../../util/FileLineGenerator'
import HugeFile from '../../util/HugeFile'

export const clearSession = () => ({ type: 'session/clear' })

export const startSession = (file, outputFileTags, channel, totalRecords) => async (dispatch, getState) => {
  const bufferFiles = {
    success: new HugeFile(file.name, outputFileTags.success,
      Config.downloadingTimeout, window.electronFs, window.tmpdir),
    fail: new HugeFile(file.name, outputFileTags.fail,
      Config.downloadingTimeout, window.electronFs, window.tmpdir)
  }

  await startRequests(
    bufferFiles, channel, totalRecords,
    Config, getState().credentials, readLines(file),
    dispatch)
}
