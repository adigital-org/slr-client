import readCsv, { blockReader, countLines } from './FileLineGenerator'

const fileContents =
`a,b,c,d
"a","b"
"a,a","b,b"
"a
a","b
b"
"a""a",b"b
a,,
a,`

test('Block file reader reads correctly', async () => {
  const file = new File([fileContents], 'demo.csv')
  const reader = blockReader(file, 7)

  expect((await reader.next()).value).toEqual('a,b,c,d')
  expect((await reader.next()).value).toEqual('\n"a","b')
})

test('CSV is parsed as expected', async () => {
  const file = new File([fileContents], 'demo.csv')
  const reader = readCsv(file)
  expect((await reader.next()).value.fields).toEqual(['a', 'b', 'c', 'd']);
  expect((await reader.next()).value.fields).toEqual(['a', 'b']);
  expect((await reader.next()).value.fields).toEqual(['a,a', 'b,b']);
  expect((await reader.next()).value.fields).toEqual(['a\na', 'b\nb']);
  expect((await reader.next()).value.fields).toEqual(['a"a', 'b"b']);
  expect((await reader.next()).value.fields).toEqual(['a', '', '']);
  expect((await reader.next()).value.fields).toEqual(['a', '']);
})

test('CSV parsing handles unicode', async () => {
  for (let i = 0; i <= 4; i++) {
    const evilString = '-'.repeat(i) + '𐀀'.repeat(4096)
    const file = new File([evilString], 'demo.csv')
    const reader = readCsv(file)
    expect((await reader.next()).value.fields).toEqual([evilString]);
  }
})

test('CSV parsing allows all kinds of new-line', async () => {
  const file = new File(['a\nb\r\nc\rd'], 'demo.csv')
  const reader = readCsv(file)
  expect((await reader.next()).value.fields).toEqual(['a']);
  expect((await reader.next()).value.fields).toEqual(['b']);
  expect((await reader.next()).value.fields).toEqual(['c']);
  expect((await reader.next()).value.fields).toEqual(['d']);
})

test('CSV line counting works as expected', async () => {
  const file = new File([fileContents], 'demo.csv')
  expect(await countLines(file)).toEqual(7)
})
