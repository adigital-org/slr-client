import scheduler from './Scheduler'

/*
 * Important Note: jest's timer mocks interact badly with promises:
 * https://stackoverflow.com/a/52196951/4173096
 * 
 * A workaround so we can do the tests is to break each advanceTimersByTime in
 * small chunks, as big as the timers that we want to see completed.
 * 
 * To make things easier, we're making some helpers below.
 */

const sleep = ms => {
  jest.advanceTimersByTime(ms)
  return Promise.resolve()
}

const sleepChunks = async (ms, times) => {
  for (let i = 0; i < times; i++) await sleep(ms)
}

test('Throttles to specified speed', async () => {
  jest.useFakeTimers()
  const cfg = {
    maxCallsPerSecond: 50,
    maxThreads: 5,
    threadStartDelay: 0
  }
  let counter = 0
  const cb = async () => ++counter < 100

  const p = scheduler(cfg, cb)

  // The function is instantaneous, so after 1s there should be exactly 50 calls
  await sleepChunks(100, 10)
  expect(counter).toEqual(50)
})

test('Starts slowly', async () => {
  jest.useFakeTimers()
  const cfg = {
    maxCallsPerSecond: 1000,
    maxThreads: 5,
    threadStartDelay: 50
  }
  let counter = 0

  // A very slow callback ensures only one job per thread will finish
  const cb = () => new Promise(resolve => {
    counter++
    setTimeout(() => resolve(counter < 60), 1000)
  })

  const p = scheduler(cfg, cb)

  // Must start asynchronously
  expect(counter).toEqual(0)

  // First call should be immediate
  await sleep(0)
  expect(counter).toEqual(1)

  // One new call every 50ms, as all threads start
  for (let i = 2; i <= 5; i++) {
    await sleep(50)
    expect(counter).toEqual(i)
  }

  // Nothing more should finish in a while (until a full second)
  await sleep(500)
  expect(counter).toEqual(5)
})

test('Returns a promise which resolves when done', async () => {
  jest.useFakeTimers()
  const cfg = {
    maxCallsPerSecond: 50,
    maxThreads: 5,
    threadStartDelay: 50
  }
  let counter = 0
  const cb = async () => ++counter < 100

  const p = scheduler(cfg, cb)

  // The callback will be run a total of 104 times,
  // because it stops at 100, but all 5 threads need
  // to run once after the stop condition, to stop themselves.
  
  // That would take 2.1s, but the slow start makes us 4 calls late,
  // so we need an extra 100ms step.
  await sleepChunks(100, 22)

  await p
  expect(counter).toEqual(104)
})

test('Everything seems ok', async () => {
  jest.useFakeTimers()
  const cfg = {
    maxCallsPerSecond: 50,
    maxThreads: 5,
    threadStartDelay: 200
  }
  let counter = 0
  const cb = async () => ++counter < 40

  const p = scheduler(cfg, cb)

  expect(counter).toEqual(0) // Starts asynchronously

  // We're doing a call every 100ms in each thread,
  // and starting new threads every 200ms
  // That gives the following numbers:
  await sleep(0); expect(counter).toEqual(1)
  await sleep(100); expect(counter).toEqual(2)
  await sleep(100); expect(counter).toEqual(4)
  await sleep(100); expect(counter).toEqual(6)
  await sleep(100); expect(counter).toEqual(9)
  await sleep(100); expect(counter).toEqual(12)
  await sleep(100); expect(counter).toEqual(16)
  await sleep(100); expect(counter).toEqual(20)
  await sleep(100); expect(counter).toEqual(25)
  await sleep(100); expect(counter).toEqual(30)
  await sleep(100); expect(counter).toEqual(35)
})
