/*
  SLR-Client CLI stdout controller
 */

import needUpdate from '../VersionChecker'

export default class Report {
  constructor(consolidatedProgress, checkForUpdates, appVersionCheckUrl, appVersion) {
    this._progress = consolidatedProgress
    this._versionCheck = 'check-disabled'

    if (checkForUpdates) {
      this._versionCheck = 'checking'
      needUpdate(appVersionCheckUrl, appVersion).then(
        (update) => this._versionCheck = update
      ).catch(() => this._versionCheck = 'check-status-failed')
    }
  }

  jsonPrint(status) {
    this._progress.update()

    const currentStats = {
      status,
      appNeedUpdate: this._versionCheck,
      totalRecords: this._progress.totalRecords,
      processed: this._progress.processed,
      found: this._progress.found,
      notFound: this._progress.notFound,
      error: this._progress.error,
      eta: this._progress.eta,
      avgRps: this._progress.avgRps,
      progress: this._progress.progress
    }

    process.stdout.write(JSON.stringify(currentStats) + '\n')
  }


  printProgress(status) {
    this.jsonPrint(status)
  }

  printEnd(reason) {
    if (reason === 0) this.printProgress('done')
    else if (reason === 1) this.printProgress('user-cancel')
    else if (reason === 3) this.printProgress('error-reading-file')
    else if (reason === 6) this.printProgress('error-saving-output-files')
    else if (reason === 7) this.printProgress('error-unprocessed-records')
    else this.printProgress('fatal-sys-error')
  }

  printError(msg) {
    process.stderr.write(`${msg}\n`)
  }

}

