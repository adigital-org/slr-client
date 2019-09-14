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

  const lineGenerator = readLines(file)
  const processNext = async () => {
    const { value, done } = await lineGenerator.next()
    if (done) return
    if (value.fields.length) {
      const hash = record2hash(value.fields, channel)

      const request = async (value, hash, key, secret, tries) => {
        try {
          const ret = await call('user/' + hash, {key, secret})
          const body = await ret.json()
          if (!ret.ok && ret.status !== 404) {
            //Bad API response (i.e. timeout) but different than CORS error.
            //Typically, this will only be fired when the client is under the same domain as the API, because
            // CORS headers are inserted only when the API request is successful (by AWS Lambda) so if the client
            // is outside the API domain and an answer different than 404 or 200 is fired,
            // a CORS exception occurs and JS gets no error info.
            //This control remains here to handle API errors under the same domain as de API.
            throw new Error('Got status ' + ret.status)
          }
          return {ret, body}
        } catch (e) { //Probably bad API response, but hidden to JS due CORS error. Try again or skip.
          if (tries < Config.maxRetries) {
            return new Promise((resolve, reject) => setTimeout(() => {
              request(value, hash, key, secret, tries+1).then(resolve).catch(reject)
            }, Config.retryWait))
          }
          else throw new Error('Too many attempts: ' + e)
        }
      }

      try {
        const { ret, body } = await request(value, hash, key, secret, 0)
        let sectors = ''
        if (ret.ok) {
          //if response is malformed, this will throw an error. body.sectors HAS TO BE null or string array.
          if (body.sectors !== null) sectors = body.sectors.sort().join('#')
          stats.found++
        } else if (ret.status === 404) {
          stats.notFound++
        }

        //Quotation rules:
        //  -Output input values as in the original files.
        //  -If at least one field in the input is quoted, we quote all added fields.
        const quote = value.quoted.filter(q => q === true).length > 0 ? '"' : ''
        result +=
          value.fields.map(
            (f,i) => (value.quoted[i] ? '"' : '') + f + (value.quoted[i] ? '"' : '')
            ) + ',' +
          quote + (ret.ok ? '1' : '0')  + quote + ',' +
          quote + sectors + quote + ',' +
          quote + body.signature + quote + '\n'
      } catch (e) {
        fails += value.fields.map(
          (f,i) => (value.quoted[i] ? '"' : '') + f + (value.quoted[i] ? '"' : '')
        ) + '\n'
        stats.error++
      }
    }
    // Start working on the next entry recursively
    return processNext()
  }

  const updateUI = () => dispatch({ type: 'session/progress', payload: stats })

  // Start some simultaneous requests, and wait until done
  const threads = []
  for (let i = 0; i < Config.maxParallel; i++) threads.push(processNext())
  const interval = window.setInterval(updateUI, Config.workingUiUpdateInterval)
  await Promise.all(threads)
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
