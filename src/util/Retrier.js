/**
 * Retry an async function call if it rejects, up to a set limit of retries.
 * 
 * The function is expected to return a promise, which we will pass through
 * in case of success.
 * 
 * When the function rejects, it will be called again up to a limit of retries.
 * If err.wait is set, a delay will be used before retrying.
 */
const retrier = (config, callback) => {

  const { tries, delay } = config

  const retryWrapper = (remaining) => {
    return callback()
      .catch(err => {
        remaining-- // Consumed one already
        console.error(`ERROR: ${err.message}. ${remaining} tries remaining.`)
        if (remaining > 0) {
          // We need to try again.
          const ms = (err && err.wait) ? delay : 0
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              retryWrapper(remaining).then(resolve).catch(reject)
            }, ms)
          })
        }
        // No more tries. Reject...
        throw err
      })
  }

  return retryWrapper(tries)
}

export default retrier
