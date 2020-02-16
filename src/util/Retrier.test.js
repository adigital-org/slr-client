import retry from './Retrier'

const sleep = ms => {
  jest.advanceTimersByTime(ms)
  return Promise.resolve()
}

test('Retries up to set limit', async () => {
  const cfg = { tries: 5, delay: 0 }
  let counter = 0
  // Always reject, consuming all retries
  const cb = () => {
    counter++
    return Promise.reject('Reject ok')
  }

  const p = retry(cfg, cb)

  await expect(p).rejects.toEqual('Reject ok')
  expect(counter).toEqual(5)
})

test('Passes on resolved value', async () => {
  const cfg = { tries: 5, delay: 0 }
  let counter = 0
  // Reject twice, then resolve
  const cb = () => {
    counter++
    if (counter === 3) return Promise.resolve('Good')
    return Promise.reject('Bad')
  }

  const p = retry(cfg, cb)

  await expect(p).resolves.toEqual('Good')
  expect(counter).toEqual(3)
})

test('Delays only when requested', async () => {
  jest.useFakeTimers()
  const cfg = { tries: 5, delay: 1000 }
  let counter = 0
  // Reject with delay twice, then without delay twice, then resolve
  const cb = () => {
    counter++
    if (counter < 3) return Promise.reject({ wait: true })
    if (counter < 5) return Promise.reject({ wait: false })
    return Promise.resolve('Good')
  }
  const p = retry(cfg, cb)
  
  await sleep(0); expect(counter).toEqual(1)
  await sleep(0); expect(counter).toEqual(1) // Didn't advance: delayed
  await sleep(1000); expect(counter).toEqual(2) // Wait delay time
  await sleep(0); expect(counter).toEqual(2) // Didn't advance: delayed
  await sleep(1000); expect(counter).toEqual(3) // Wait delay time
  await sleep(0); expect(counter).toEqual(4)
  await sleep(0); expect(counter).toEqual(5)
  
  await expect(p).resolves.toEqual('Good')
})
