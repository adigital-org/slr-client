/*
  SLR-Client CLI File class simulator for compatibility with FileLineGenerator.js
 */

import * as nodeFs from 'fs'

export default class File {
  constructor(fileParts, fileName, filePath) {
    try {
      const fullPath = filePath + '/' + fileName
      const stats = nodeFs.statSync(fullPath)
      this.size = stats.size
      this.end = this.size
      this.lastModified = Math.floor(stats.mtimeMs)
      this.name = fileName
      this.path = fullPath
      this.start = 0
    } catch (e) {
      throw new Error('File not found.')
    }
  }

  slice(start, end) {
    if (this.name !== null && start >= 0 && end >= 0 && start <= this.size) {
      this.start = start
      this.end = (end > this.size) ? this.size : end
      return this
    } else {
      throw new Error(`Out of file limits. File size: ${this.size}, slice start: ${start}, slice end: ${end}`)
    }
  }
}