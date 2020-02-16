/**
 * Handles the scheduling of calls to the callback function.
 * 
 * This function was designed to handle the temporal aspect of the request
 * system, including the slow-start, and throttling to limit the calls per
 * second.
 *
 * The callback function is expected to return a promise for a boolean,
 * indicating whether it finished, or we need to keep calling it.
 */
const scheduler = async (config, callback) => {
  
  // Prepare our settings according to config
  const { threadStartDelay, maxThreads, maxCallsPerSecond } = config

  // If no threads or CPS, finish work
  const maxCpsPerThread = maxCallsPerSecond / maxThreads
  const startingThreads = maxCpsPerThread ? maxThreads : 0

  // Wrap the callback to add some behaviour between iterations
  const doWork = async (i) => {
    const startTime = Date.now()
    const r = await callback()
    
    // Done? Stop
    if (!r) return

    // Otherwise, check if throttling is needed, and continue working
    return new Promise((resolve, reject) => {
      const took = Date.now() - startTime
      const wait = (Math.floor(1000 / maxCpsPerThread) - took)
      setTimeout(
        () => doWork(i).then(resolve).catch(reject),
        wait > 0 ? wait : 0
      )
    })
  }

  // Start the calls with slow-start
  const threads = []
  for (let i = 0; i < startingThreads; i++) {
    threads.push(
      new Promise((resolve, reject) =>
        setTimeout(
          () => {
            doWork(i).then(resolve).catch(reject)
          },
          threadStartDelay * i
        )
      )
    )
  }

  await Promise.all(threads)
}

export default scheduler
