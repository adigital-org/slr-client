import FileSaver from 'file-saver'

export default class HugeFile {
  constructor(fileName, saveTag, downloadingTimeout, nodeFs = null, tmpdir = null) {
    this.downloadingTimeout = downloadingTimeout
    this.filename = fileName

    this.taggedFileName = (typeof saveTag !== 'undefined') ? this._insertTag(saveTag) : this.filename

    const random = Math.floor(Math.random()*1000000)
    this.tmpFilePath = `${tmpdir}/${this.taggedFileName}_slr-client-${random}.tmp`

    this.nodeFs = nodeFs
    this.stream = this.nodeFs ? this.nodeFs.createWriteStream(this.tmpFilePath, {flags: 'w'}) : null

    this.plain = ''
    this.totalRecords = 0

    this._writable = true
  }

  _checkAndResolve(file, checker, res, rej) {
    // This timeout improves user experience when saving results in React by
    // allowing visualization of "downloading" animation for some seconds.
    // On CLI version downloadingTimeout can safely be 0.
    const chProm = checker.check(file)
    chProm.then(() => {setTimeout(() => res(), this.downloadingTimeout)})
      .catch((e) => rej(e))
  }
  _fsSave(checker, folder = null) {
    if (folder === null) folder = window.electronFolderDialog({properties: ['openDirectory']})
    if (folder) {
      const outputFilePath = folder + '/' + this.taggedFileName
      return new Promise((res, rej) => {
        this.nodeFs.copyFile(
          this.tmpFilePath, outputFilePath, () => {
            this._checkAndResolve(
              new File([], outputFilePath),
              checker,
              res,
              rej
            )
          }
        )
      })
    } else return new Promise((res) => {res()})
  }
  _browserSave(checker) {
    const outputBlob = new Blob([this.plain], { type: 'text/plain;charset=utf-8' })
    FileSaver.saveAs(outputBlob, this.taggedFileName)
    return new Promise((res, rej) => {
      this._checkAndResolve(outputBlob, checker, res, rej)
    })
  }

  set(value, n) {
    if (!this._writable) throw new Error("ERROR: writing attempt to a closed HugeFile.")
    this.totalRecords =
      n !== undefined && n !== null ? this.totalRecords+n : this.totalRecords+1
    this.nodeFs ? this.stream.write(value) : this.plain += value
  }

  done() {
    this._writable = false
    if (this.nodeFs) this.stream.end()
  }

  _insertTag(tag) {
    const fileName = this.filename.replace(/\.[^/.]+$/, "")
    const fileExt = this.filename.substr(fileName.length)

    const isoDate = new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .substring(0, 15)

    return fileName + tag + isoDate + fileExt
  }

  save(checker, folder = null) {
    return this.nodeFs ? this._fsSave(checker, folder) : this._browserSave(checker)
  }

  delete() {
    if (this.nodeFs) this.nodeFs.unlinkSync(this.tmpFilePath)
  }
}