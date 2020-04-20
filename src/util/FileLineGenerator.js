export async function* blockReader(file, chunkSize = 20 * 4096) {
  let lastByte = 0
  const readSlice = (start, end) => new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = (evt) => resolve(evt.target.result)
    fr.onerror = reject
    const blob = file.slice(lastByte, lastByte + chunkSize)
    fr.readAsBinaryString(blob)
  })
  while (lastByte < file.size) {
    yield readSlice(lastByte, lastByte + chunkSize)
    lastByte += chunkSize
  }
}

function utf8converter(bytes) {
  // Manually convert from binary string to utf8 codepoints
  let ix = 0
  if (bytes.slice(0, 3) === "\xEF\xBB\xBF") ix = 3

  let string = ""
  while (ix < bytes.length) {
    const byte1 = bytes[ix].charCodeAt(0)
    if (byte1 < 0x80) {
      string += String.fromCharCode(byte1)
    } else if (byte1 >= 0xC2 && byte1 < 0xE0) {
      const byte2 = bytes[++ix].charCodeAt(0);
      string += String.fromCharCode(((byte1 & 0x1F) << 6) + (byte2 & 0x3F))
    } else if (byte1 >= 0xE0 && byte1 < 0xF0) {
      const byte2 = bytes[++ix].charCodeAt(0)
      const byte3 = bytes[++ix].charCodeAt(0)
      string += String.fromCharCode(((byte1 & 0xFF) << 12) + ((byte2 & 0x3F) << 6) + (byte3 & 0x3F))
    } else if (byte1 >= 0xF0 && byte1 < 0xF5) {
      const byte2 = bytes[++ix].charCodeAt(0)
      const byte3 = bytes[++ix].charCodeAt(0)
      const byte4 = bytes[++ix].charCodeAt(0)
      let codepoint = ((byte1 & 0x07) << 18) + ((byte2 & 0x3F) << 12) + ((byte3 & 0x3F) << 6) + (byte4 & 0x3F)
      codepoint -= 0x10000
      string += String.fromCharCode((codepoint >> 10) + 0xD800, (codepoint & 0x3FF) + 0xDC00)
    }
    ix++
  }
  return string
}

/**
 * Reads a CSV file, yielding each line as it finds it.
 *
 * The parsing of the CSV file is done as specified on RFC 4180, but with some
 * enhancements for better compatibility:
 *
 * - Recover from syntax errors such as unescaped quotes on quoted fields
 * - Allow all newline formats (CR/LF/CRLF), even mixed
 * - Skip empty lines
 *
 * The automaton generated from the rules looks roughly like this:
 * ![diagram](https://i.imgur.com/Hlydvf1.png)
 *
 * For implementation, we've numbered the states like this:
 *
 * - 0: Line start
 * - 1: Field start
 * - 2: Unquoted field
 * - 3: Quoted field
 * - 4: Quoted quote
 *
 * And the inputs as:
 * - 0: New Line
 * - 1: Comma
 * - 2: Quote
 * - 3: Everything else
 *
 * Resulting in the following transition table:
 *
 * | St. | 0 | 1 | 2 | 3 |
 * |-----|---|---|---|---|
 * |  0  | 0 | 1 | 3 | 2 |
 * |  1  | 0 | 1 | 3 | 2 |
 * |  2  | 0 | 1 | 2 | 2 |
 * |  3  | 3 | 3 | 4 | 3 |
 * |  4  | 0 | 1 | 3 | 3 |
 *
 * Also, we defined the following actions that can be performed on each char:
 *
 * - 0: No action
 * - 1: Push it into the current field
 * - 2: Finish the field and start a new one
 * - 3: Finish the line and start a new one
 *
 * Resulting in the following actions table:
 *
 * | St. | 0 | 1 | 2 | 3 |
 * |-----|---|---|---|---|
 * |  0  | 0 | 2 | 0 | 1 |
 * |  1  | 3 | 2 | 0 | 1 |
 * |  2  | 3 | 2 | 1 | 1 |
 * |  3  | 1 | 1 | 0 | 1 |
 * |  4  | 3 | 2 | 1 | 1 |
 *
 */

const transitionTable = [
  [ 0, 1, 3, 2 ],
  [ 0, 1, 3, 2 ],
  [ 0, 1, 2, 2 ],
  [ 3, 3, 4, 3 ],
  [ 0, 1, 3, 3 ]
]

const actionTable = [
  [ 0, 2, 0, 1 ],
  [ 3, 2, 0, 1 ],
  [ 3, 2, 1, 1 ],
  [ 1, 1, 0, 1 ],
  [ 3, 2, 1, 1 ]
]

const getInputType = (char) => {
  switch (char) {
    case '\n':
    case '\r':
      return 0
    case ',':
      return 1
    case '"':
      return 2
    default:
      return 3
  }
}

async function* readCsv(file) {
  let currentLine = {fields: [], quoted: []}
  let currentField = ''
  let quotedField = false
  let state = 0

  /*
   * Note that we can use utf8converter after the parsing because none of the
   * control chars (comma, new-line, quote, escape) are multi-byte, and the
   * string concatenation on each field doesn't care about continuation bytes.
   */
  for await (const chunk of blockReader(file,10 * 4096)) {
    for (let i = 0; i < chunk.length; i++) {
      const letter = chunk[i]
      const inputType = getInputType(letter)

      const nextState = transitionTable[state][inputType]
      const action = actionTable[state][inputType]

      switch (action) {
        case 0:
          if (inputType === 2) quotedField = true
          break;
        case 1:
          currentField += letter
          break
        case 2:
          currentLine.fields.push(utf8converter(currentField))
          currentLine.quoted.push(quotedField)
          currentField = ''
          quotedField = false
          break
        case 3:
          currentLine.fields.push(utf8converter(currentField))
          currentLine.quoted.push(quotedField)
          yield currentLine
          currentField = ''
          quotedField = false
          currentLine = {fields: [], quoted: []}
          break
        default:
          break
      }

      state = nextState
    }
  }

  if (state !== 0) {
    currentLine.fields.push(utf8converter(currentField))
    currentLine.quoted.push(quotedField)
    yield currentLine
  }
}

export async function countLines(file) {
  let totalLines = 0
  let state = 0
  let pendingConts = 0

  for await (const chunk of blockReader(file)) {
    for (let i = 0; i < chunk.length; i++) {
      const inputType = getInputType(chunk[i])

      const c = chunk[i].charCodeAt(0)
      let isError = false
      if (pendingConts) {
        // Every continuation byte must start with bits 10
        if ((c & 0xC0) !== 0x80) isError = true
        pendingConts--
      } else if (c & 0x80) {
        // Multi-byte sequence detected. Check if well formed.
        // Discard the first 1, and get the next 4 bits
        let prefix = (c & 0x78) >> 3 
        if (prefix < 8 || prefix === 15) {
          // Not allowed at a multi-byte seq start
          isError = true 
        } else {
          // Calc how many continuation bytes should follow after this one
          pendingConts = prefix < 12 ? 1 : prefix < 14 ? 2 : 3
        }
      }
      if (isError) throw new Error('Malformed UTF8 at line: ' + (totalLines + 1))

      const nextState = transitionTable[state][inputType]
      const action = actionTable[state][inputType]

      if (action === 3) totalLines++

      state = nextState
    }
  }

  if (state !== 0) totalLines++

  return totalLines
}


export default readCsv
