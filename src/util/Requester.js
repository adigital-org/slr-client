import { record2hash } from './SLRUtils'
import { call } from './Api'
import scheduler from './Scheduler'
import retrier from './Retrier'

export const startRequests = async (hugeFiles, channel, totalRecords, Config, credentials, lineGenerator, reportStatus, agent) => {
  const stats = { found: 0, notFound: 0, error: 0, totalRecords }

  const status = {
    originalFilename: hugeFiles.success.filename,
    stats,
    results: hugeFiles
  }

  reportStatus({ type: 'session/start', payload: status })

  const { key, secret } = credentials

  const setSuccess = (hashedRecords, resBody) => {
    // Loop over hashedRecords, generate output lines and update stats.
    // There should be one entry in response body for each entry in
    // hashedRecords, so if due to an API error there is a hash missing in the
    // response body, this will throw an exception that should be caught by the
    // caller and send all records to error output.
    const hashes = Object.keys(hashedRecords)
    for (let hash of hashes) {
      for (let record of hashedRecords[hash]) {
        status.results.success.set(
          genSucCsvLine(
            record,
            resBody[hash].found,
            resBody[hash].sectors.join('#'),
            resBody[hash].signature
          )
        )
        resBody[hash].found ? stats.found++ : stats.notFound++
      }
    }
  }
  const genSucCsvLine = (record, found, sectors, signature) => {
    // Quotation rules:
    //  -Output input values as in the original file.
    //  -If at least one field in the input is quoted, we quote all added fields.
    const quote = record.quoted.filter(q => q === true).length > 0 ? '"' : ''
    return record.fields.map(
      (f,i) => (record.quoted[i] ? '"' : '') + f + (record.quoted[i] ? '"' : '')
      ) + ',' +
      quote + (found ? '1' : '0')  + quote + ',' +
      quote + sectors + quote + ',' +
      quote + signature + quote + '\n'
  }

  const setErrors = (hashedRecords) => {
    const keys = Object.keys(hashedRecords)
    for (let key of keys) {
      for (let record of hashedRecords[key]) {
        status.results.fail.set(genErrCsvLine(record))
        stats.error++
      }
    }
  }
  const genErrCsvLine = (record) => {
    // Output input values as in the original file.
    return record.fields.map(
      (f,i) => (record.quoted[i] ? '"' : '') + f + (record.quoted[i] ? '"' : '')
    ) + '\n'
  }

  const processNext = async () => {
    // According to SLR documentation, we can expect some 502 and 500 errors
    // (about ~1 every ~150.000 requests). Because of this, we should
    // retry each request up to Config.maxAttempts times.
    // We also add a delay of Config.retryWait when the status code is 429.
    const retryCfg = { tries: Config.maxAttempts, delay: Config.retryWait }
    const request = (reqBody, channel, key, secret) =>
      retrier(retryCfg, async () => {
        const ret = await call('user', {key, secret}, Config, reqBody, agent)
        const body = await ret.json()
        if (ret.ok) return body

        // If error was a code HTTP 429 (overload), ask retry system to slow down a bit
        // Otherwise, just retry again right away
        console.error(`ERROR: API ${ret.status} response`)
        const err = new Error(ret.statusText)
        if (ret.status === 429) err.wait = true
        throw err
      })

    const recordsPromises = []
    for (let i = 0; i < Config.hashesPerRequest; i++) {
      recordsPromises.push(lineGenerator.next())
    }
    const records = await Promise.all(recordsPromises)
    if (records[0].done) return // No records remaining. Stop this thread.

    // According with SLR API documentation, the request cannot have duplicated
    // hashes but a company may have the same record two or more times, so
    // there is a chance to find duplicated records in the same batch.
    // To prevent API 400 response due to duplicated records, request this
    // record only once and output to company as many times as needed.
    // To achieve this, we will use a json map with hashes as key and
    // an array with the records. We will loop this array when saving results.
    const hashedRecords = {}
    for (let record of records) {
      if (record.done) break;
      let hash = record2hash(record.value.fields, channel)
      if (hash === null || hash.length <= 0) {
        setErrors({'fakeKey': [record.value]})
      } else {
        if (hashedRecords[hash]) hashedRecords[hash].push(record.value)
        else hashedRecords[hash] = [record.value]
      }
    }

    try {
      const reqBody = Object.keys(hashedRecords).join(',')
      const resBody = await request(reqBody, channel, key, secret)
      setSuccess(hashedRecords, resBody)
    } catch (e) {
      // request() will try to handle API errors, but if Config.maxAttempt is
      // reached, an exception will be thrown due to too many errors and this
      // thread have to be stopped to reduce concurrency.
      setErrors(hashedRecords)
      return
    }

    return true // Continue with next entry
  }

  const pushToFailed = async () => {
    const { value, done } = await lineGenerator.next()
    if (done) return
    setErrors({'fakeKey': [value]})
    return pushToFailed()
  }

  const reportProgress = () => reportStatus({ type: 'session/progress', payload: status })

  // Config.maxParallel can be 0 in cluster mode (CLI) due to API errors.
  const cfg = {
    threadStartDelay: Config.threadStartDelay,
    maxThreads: Config.maxParallel,
    maxCallsPerSecond: Config.maxRps / Config.hashesPerRequest
  }
  const donePromise = scheduler(cfg, processNext)

  const interval = setInterval(reportProgress, Config.workingUiUpdateInterval)
  await donePromise
  const successfulReq = stats.found + stats.notFound + stats.error
  if (successfulReq < stats.totalRecords) await pushToFailed()
  clearInterval(interval)
  reportProgress()

  // Requests done.
  status.results.success.done(stats.found + stats.notFound)
  status.results.fail.done(stats.error)

  // Set status done
  reportStatus({ type: 'session/done', payload: status })
}
