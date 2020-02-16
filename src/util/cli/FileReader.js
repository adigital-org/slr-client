/*
  SLR-Client CLI FileReader class simulator for compatibility with FileLineGenerator.js
 */

import * as nodeFs from 'fs'

export default class FileReader {
  constructor() {}

  onload() {return null}
  onerror() {return null}

  readAsBinaryString(file) {
    if (file.path === null) this.onerror('No such file')
    else {
      nodeFs.open(file.path, 'r', (err, fd) => {
        if (err) this.onerror('Unable to open file: ' + file.path)
        else {
          const bytesToRead = file.end - file.start
          const buffer = Buffer.alloc(bytesToRead)
          nodeFs.read(fd, buffer, 0, bytesToRead, file.start,
            (err, bytesRead, buffer) => {
              if (err) this.onerror('Unable to read file: ' + file.path)
              else {
                this.onload({target: {result: buffer.toString('binary')}})
              }
            }
          )
        }
      })
    }
  }
}