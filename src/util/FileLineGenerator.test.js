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

test('CSV line counting detects UTF8 errors', async () => {
  const msg = 'Malformed UTF8 at line: 1'
  const countLinesB = arr => {
    const file = new File([new Uint8Array(arr)], 'demo.csv')
    return countLines(file)
  }
  await expect(countLinesB([36, 194, 162, 36, 36, 36])).resolves.toEqual(1) // 2-byte ok
  await expect(countLinesB([36, 224, 164, 185, 36, 36])).resolves.toEqual(1) // 3-byte ok
  await expect(countLinesB([36, 240, 144, 141, 136, 36])).resolves.toEqual(1) // 4-byte ok

  await expect(countLinesB([36, 36, 162, 36, 36, 36])).rejects.toEqual(new Error(msg)) // cont without start
  await expect(countLinesB([36, 194, 36, 36, 36, 36])).rejects.toEqual(new Error(msg)) // 2-byte missing last
  await expect(countLinesB([36, 224, 164, 36, 36, 36])).rejects.toEqual(new Error(msg)) // 3-byte missing last
  await expect(countLinesB([36, 240, 144, 141, 36, 36])).rejects.toEqual(new Error(msg)) // 4-byte missing last
  await expect(countLinesB([36, 255, 36, 36, 36, 36])).rejects.toEqual(new Error(msg)) // invalid byte
})
