import { call } from '../../util/Api'
import readLines from '../../util/FileLineGenerator'
import { record2hash } from '../../util/SLRUtils'
import Config from '../../config'

export const clearSession = () => ({ type: 'session/clear' })

export const startSession = (file, channel, totalRecords) => async (dispatch, getState) => {
  dispatch({ type: 'session/start', payload: { originalFilename: file.name } })
  const { key, secret } = getState().credentials

  let result = ''
  let fails = ''
  const stats = { found: 0, notFound: 0, error: 0, totalRecords }

  const genSucCsvLine = (value, ok, sectors, signature) => {
    // Quotation rules:
    //  -Output input values as in the original files.
    //  -If at least one field in the input is quoted, we quote all added fields.
    const quote = value.quoted.filter(q => q === true).length > 0 ? '"' : ''
    return value.fields.map(
        (f,i) => (value.quoted[i] ? '"' : '') + f + (value.quoted[i] ? '"' : '')
      ) + ',' +
      quote + (ok ? '1' : '0')  + quote + ',' +
      quote + sectors + quote + ',' +
      quote + signature + quote + '\n'
  }
  const genErrCsvLine = (value) => {
    return value.fields.map(
      (f,i) => (value.quoted[i] ? '"' : '') + f + (value.quoted[i] ? '"' : '')
    ) + '\n'
  }
  const lineGenerator = readLines(file)
  const processNext = async () => {
    const { value, done } = await lineGenerator.next()
    if (done) return
    if (value.fields.length) {
      const request = async (value, channel, key, secret, tries) => {
        const hash = record2hash(value.fields, channel)
        if (hash === null) throw new Error('Malformed record: ' + value)
        try {
          const ret = await call('user/' + hash, {key, secret})
          const body = await ret.json()
          if (!ret.ok && ret.status !== 404) {
            // Bad API response (i.e. timeout) but different than CORS error.
            // Typically, this will only be fired when the client is under the same domain as the API, because
            //  CORS headers are inserted only when the API request is successful (by AWS Lambda) so if the client
            //  is outside the API domain and an answer different than 404 or 200 is fired,
            //  a CORS exception occurs and JS gets no error info.
            // This control remains here to handle API errors under the same domain as de API.
            throw new Error('Got status ' + ret.status)
          }
          return {ret, body}
        } catch (e) { // Probably bad API response, but hidden to JS due CORS error. Try again or skip.
          if ((tries < Config.maxAttempts-1)) {
            return new Promise((resolve, reject) => setTimeout(() => {
              request(value, channel, key, secret, tries+1).then(resolve).catch(reject)
            }, Config.retryWait))
          }
          else throw new Error('Too many attempts: ' + e)
        }
      }

      try {
        const { ret, body } = await request(value, channel, key, secret, 0)
        let sectors = ''
        if (ret.ok) {
          // If response is malformed, this will throw an error. body.sectors HAS TO BE null or a string array.
          if (body.sectors !== null) sectors = body.sectors.sort().join('#')
          stats.found++
        } else if (ret.status === 404) {
          stats.notFound++
        }
        result += genSucCsvLine(value, ret.ok, sectors, body.signature)
      } catch (e) {
        fails += genErrCsvLine(value)
        stats.error++
        // Stop this thread. Keep it working only if malformed record.
        if (e.message.substr(0,16) !== 'Malformed record') return
      }
    }
    // Start working on the next entry recursively
    return processNext()
  }
  const pushToFailed = async () => {
    const { value, done } = await lineGenerator.next()
    if (done) return
    fails += genErrCsvLine(value)
    stats.error++
    return pushToFailed()
  }

  const updateUI = () => dispatch({ type: 'session/progress', payload: stats })

  // Start some simultaneous requests, and wait until done
  const threads = []
  for (let i = 0; i < Config.maxParallel; i++) threads.push(processNext())
  const interval = window.setInterval(updateUI, Config.workingUiUpdateInterval)
  await Promise.all(threads)
  const successfulReq = stats.found + stats.notFound + stats.error
  if (successfulReq < stats.totalRecords) await pushToFailed()
  window.clearInterval(interval)
  updateUI()

  // When done, generate a blob and save it
  const blob = new Blob([result], { type: 'text/plain;charset=utf-8' })
  const blobFails = new Blob([fails], { type: 'text/plain;charset=utf-8' })
  const fileName = file.name.replace(/\.[^/.]+$/, "")
  const fileExt = file.name.substr(fileName.length)

  dispatch({ type: 'session/done', payload: {
    fileName: fileName,
    fileExt: fileExt,
    success: (blob.size > 0 ? blob : null),
    fail: (blobFails.size > 0 ? blobFails : null)
  }})
}
