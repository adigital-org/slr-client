/*
  SLR-Client CLI FileReader class simulator for compatibility with FileLineGenerator.js
 */

import * as nodeFs from 'fs'

export default class FileReader {
  onload() {}
  onerror() {}

  readAsArrayBuffer(file) {
    const fs = window.electronFs ? window.electronFs : nodeFs

    if (file.path === null) this.onerror('No such file')
    else {
      fs.open(file.path, 'r', (e, fd) => {
        if (e) this.onerror(`Unable to open file: ${file.path} due to: ${e}`)
        else {
          const bytesToRead = file.end - file.start
          const buffer = new Uint8Array(bytesToRead)
          fs.read(fd, buffer, 0, bytesToRead, file.start,
            (e, bytesRead, buffer) => {
              if (e) this.onerror(`Unable to read file: ${file.path} due to: ${e}`)
              else {
                fs.close(fd, (e) => {
                  if (e) this.onerror(`Unable to close file: ${file.path} due to: ${e}`)
                  else this.onload({target: {result: buffer}})
                })
              }
            }
          )
        }
      })
    }
  }
}