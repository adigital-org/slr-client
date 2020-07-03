import IntegrityChecker from './IntegrityChecker'

const fileContents =
`555444666
555478926


555974541
555111222

`

test('Run an integrity check on a correct (output) file', async () => {
  const file = new File([fileContents], 'demo.csv')
  const ic = new IntegrityChecker(4)

  return expect((await ic.check(file))).toEqual(true)
})

test('Run an integrity check on a (output) file with missing records', async () => {
  const file = new File([fileContents], 'demo.csv')
  const ic = new IntegrityChecker(3)

  return ic.check(file)
    .then((r) => expect(r).toBeUndefined())
    .catch((e) => expect(e).toEqual("Missing records."))
})

test('Run an integrity check on a corrupt (output) file that cant be opened', async () => {
  const ic = new IntegrityChecker(5)

  return ic.check()
    .then((r) => expect(r).toBeUndefined())
    .catch((e) => expect(e).toEqual("Could not open output file to check integrity."))
})