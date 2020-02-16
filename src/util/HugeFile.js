import FileSaver from 'file-saver'

export default class HugeFile {
  constructor(fileName, saveTag, downloadingTimeout, nodeFs = null, tmpdir = null) {
    this.downloadingTimeout = downloadingTimeout
    this.filename = fileName

    this.taggedFileName = (typeof saveTag !== 'undefined') ? this.insertTag(saveTag) : this.filename

    const random = Math.floor(Math.random()*1000000)
    this.tmpFilePath = `${tmpdir}/${this.taggedFileName}_slr-client-${random}.tmp`

    this.nodeFs = nodeFs
    this.stream = this.nodeFs ? this.nodeFs.createWriteStream(this.tmpFilePath, {flags: 'w'}) : null

    this.plain = ''
    this.totalRecords = 0
  }

  fsSave(folder = null) {
    if (folder === null) folder = window.electronFolderDialog({properties: ['openDirectory']})
    if (folder) {
      return new Promise((res) => {
        setTimeout(
          () => {
            this.nodeFs.copyFile(
              this.tmpFilePath, folder + '/' + this.taggedFileName, res
            )
          },
          this.downloadingTimeout
        )
      })
    } else return new Promise((res) => {res()})
  }
  browserSave() {
    FileSaver.saveAs(
      new Blob([this.plain], { type: 'text/plain;charset=utf-8' }),
      this.taggedFileName
    )
    return new Promise((res) => {
      setTimeout(() => res(), this.downloadingTimeout)
    })
  }

  set(value) {
    this.nodeFs ? this.stream.write(value) : this.plain += value
  }

  done(totalRecords) {
    if (this.nodeFs) this.stream.end()
    this.totalRecords = totalRecords
  }

  insertTag(tag) {
    const fileName = this.filename.replace(/\.[^/.]+$/, "")
    const fileExt = this.filename.substr(fileName.length)

    const isoDate = new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .substring(0, 15)

    return fileName + tag + isoDate + fileExt
  }

  save(folder = null) {
    return this.nodeFs ? this.fsSave(folder) : this.browserSave()
  }

  delete() {
    if (this.nodeFs) this.nodeFs.unlinkSync(this.tmpFilePath)
  }
}