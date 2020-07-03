/*
  SLR-Client CLI File class simulator for compatibility with FileLineGenerator.js
 */

import * as nodeFs from 'fs'
import { basename } from 'path'

export default class File {
  constructor(fileParts, filePath) {
    const fs = window.electronFs ? window.electronFs : nodeFs
    const bName = window.basename ? window.basename : basename

    try {
      const fullPath = filePath
      const stats = fs.statSync(fullPath)
      this.size = stats.size
      this.end = this.size
      this.lastModified = Math.floor(stats.mtimeMs)
      this.name = bName(filePath)
      this.path = fullPath
      this.start = 0
    } catch (e) {
      throw new Error(`File "${filePath}" not found.`)
    }
  }

  slice(start, end) {
    if (this.name !== null && start >= 0 && end >= 0 && start <= this.size) {
      this.start = start
      this.end = (end > this.size) ? this.size : end
      return this
    } else {
      throw new Error(`Out of file limits. File size: ${this.size}, slice start: ${start}, slice end: ${end}.`)
    }
  }
}