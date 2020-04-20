/*
  SLR-Client CLI FileReader class simulator for compatibility with FileLineGenerator.js
 */

import * as nodeFs from 'fs'

export default class FileReader {
  constructor() {}

  onload() {}
  onerror() {}

  readAsBinaryString(file) {
    if (file.path === null) this.onerror('No such file')
    else {
      nodeFs.open(file.path, 'r', (e, fd) => {
        if (e) this.onerror(`Unable to open file: ${file.path} due to: ${e}`)
        else {
          const bytesToRead = file.end - file.start
          const buffer = Buffer.alloc(bytesToRead)
          nodeFs.read(fd, buffer, 0, bytesToRead, file.start,
            (e, bytesRead, buffer) => {
              if (e) this.onerror(`Unable to read file: ${file.path} due to: ${e}`)
              else {
                nodeFs.close(fd, (e) => {
                  if (e) this.onerror(`Unable to close file: ${file.path} due to: ${e}`)
                  else this.onload({target: {result: buffer.toString('binary')}})
                })
              }
            }
          )
        }
      })
    }
  }
}