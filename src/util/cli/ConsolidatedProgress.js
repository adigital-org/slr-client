/*
  SLR-Client CLI Node workers progress consolidator
 */

export default class ConsolidatedProgress {
  constructor(totalRecords) {
    this.totalRecords = totalRecords
    this._startTime = Date.now()
    this._tasksProgress = []

    this.processed = 0
    this.found = 0
    this.notFound = 0
    this.error = 0
    this.avgRps = 0
    this.progress = 0
    this.eta = 0
    this.elapsedTime = 0
  }

  _consolidate() {
    let ok = 0
    let ko = 0
    let err = 0
    for (let taskStats of this._tasksProgress) {
      if (typeof taskStats === "undefined") continue
      ok += taskStats.found
      ko += taskStats.notFound
      err += taskStats.error
    }
    this.found = ok
    this.notFound = ko
    this.error = err

    this.processed =
      this.found +
      this.notFound +
      this.error
  }
  _calcElapsedTime() {
    this.elapsedTime = Date.now()-this._startTime
  }
  _calcRps() {
    this.avgRps = Math.floor(this.processed/(this.elapsedTime/1000))
  }
  _calcProgress() {
    this.progress = Math.floor(this.processed/this.totalRecords*100)
  }
  _calcEta() {
    const etaMs = Math.floor((this.totalRecords*this.elapsedTime)/this.processed - this.elapsedTime)
    this.eta = new Date(
        (isFinite(etaMs) && etaMs > 0) ? etaMs : 0
    ).toISOString().substr(11, 8)
  }

  setStats(taskId, taskStats) {
    this._tasksProgress[taskId] = taskStats
  }
  update() {
    this._consolidate()
    this._calcElapsedTime()
    this._calcRps()
    this._calcProgress()
    this._calcEta()
  }

  updateTotalRecords(totalRecords) {
    this.totalRecords = totalRecords
    this.update()
  }
}