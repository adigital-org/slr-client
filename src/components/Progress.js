import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {FormattedMessage, FormattedNumber, injectIntl} from 'react-intl'
import { connect } from 'react-redux'
import IntegrityChecker from '../util/IntegrityChecker'
import ProgressBar from './ProgressBar'
import Spinner from "./Spinner";
import { clearSession } from '../store/actions/requests'

import './Progress.sass'

class Progress extends Component {
  static propTypes = {
    clearSession: PropTypes.func.isRequired,
    originalFilename: PropTypes.string,
    stats: PropTypes.object,
    done: PropTypes.bool,
    results: PropTypes.object
  }

  constructor (props) {
    super(props)
    this.state = {
      downloading: false,
      downloaded: { success: false, fail: false }
    }
  }

  static help = 'progress-help-placeholder'

  deleteResults() {
    this.props.results.success.delete()
    this.props.results.fail.delete()
  }

  componentDidMount() {
    window.onbeforeunload = () => {
      this.deleteResults()
    }
  }

  componentWillUnmount() {
    this.deleteResults()
  }

  handleReset = () => {
    let askMsg = null
    if (this.props.results && this.props.results.success.totalRecords > 0 && !this.state.downloaded.success) {
      askMsg = this.props.intl.formatMessage({
        id: 'progress.reset.success.pending'
      })
    } else if (this.props.results && this.props.results.fail.totalRecords > 0 && !this.state.downloaded.fail) {
      askMsg = this.props.intl.formatMessage({
        id: 'progress.reset.fail.pending'
      })
    }

    if ( askMsg )
      window.confirm(askMsg) && this.props.clearSession()
    else
      this.props.clearSession()
  }

  handleCancel = () => {
    //Primitive method to force stop processing file.
    const msg = this.props.intl.formatMessage({
      id: 'progress.cancel.msg'
    })
    window.confirm(msg) && window.location.reload()
  }

  downloadDone = (type) => {
    const newState = this.state
    newState.downloaded[type] = true
    newState.downloading = false
    this.setState(newState)
  }
  handleDownload = (success) => {
    const type = success ? 'success' : 'fail'
    this.setState({downloading: true})
    document.activeElement.blur()

    if (this.props.stats.totalRecords !==
      this.props.results.success.totalRecords + this.props.results.fail.totalRecords) {
      window.alert(this.props.intl.formatMessage({
        id: 'progress.error.processed.mismatch'
      }))
    }

    // Electron is not compatible with post-save integrity checks: bypass them with a fake promise.
    const downloading = this.props.results[type].save(
      new IntegrityChecker(this.props.results[type].totalRecords)
    )
    downloading.then(() => this.downloadDone(type))
      .catch((e) => {
        window.alert(this.props.intl.formatMessage({
          id: 'progress.error.saving.mismatch'
        }))
        console.error(e)
        this.downloadDone(type)
      })
  }
  handleDownloadSuccess = () => {this.handleDownload(true)}
  handleDownloadFail = () => {this.handleDownload(false)}

  render = () => {
    return (
      <div id="progress" className="box">
        <h1><FormattedMessage id={this.props.done ? "progress.title.done" : "progress.title"} /></h1>
        {this.props.originalFilename && (
          <div className="filename">
            <div>
              { this.props.originalFilename }
            </div>
          </div>
        )}
        {this.props.stats && (
          <div className="progress-body">
            <div className="progress-status">
                <ProgressBar value={
                  this.props.stats.totalRecords === 0 ? 100 : Math.floor((
                  this.props.stats.found +
                  this.props.stats.notFound +
                  this.props.stats.error)
                  /this.props.stats.totalRecords*100
                )}
                />
            </div>

            <ul className="table">
              <li>
                <FormattedMessage id="progress.total" />
                <span className="statics-data">
                  <FormattedNumber value={this.props.stats.totalRecords} />
                </span>
              </li>
              <li>
                <FormattedMessage id="progress.found" />
                <span className="statics-data">
                  <FormattedNumber value={this.props.stats.found} />
                </span>
              </li>
              <li>
                <FormattedMessage id="progress.notFound" />
                <span className="statics-data">
                  <FormattedNumber value={this.props.stats.notFound} />
                </span>
              </li>
              <li>
                <FormattedMessage id="progress.error" />
                <span className="statics-data">
                  <FormattedNumber value={this.props.stats.error} />
                </span>
              </li>
            </ul>
          </div>
        )}
        <div className={this.props.results ? "downloads-bar" : "downloads-bar hidden"}>
          {(!this.props.results || this.state.downloading ) &&
            <label className="button-with-text placeholder hidden">
              <button className="download-button fail" />
              <FormattedMessage id="progress.download.fail" />
            </label>
          }
          {this.state.downloading &&
            <div className="downloading">
              <Spinner />
              <FormattedMessage id="progress.download.downloading" />
            </div>
          }
          {!this.state.downloading && this.props.results && this.props.results.success.totalRecords > 0 &&
            <label className="button-with-text">
              <button className="download-button success" onClick={this.handleDownloadSuccess} />
              <FormattedMessage id="progress.download.success" />
            </label>
          }
          {!this.state.downloading && this.props.results && this.props.results.fail.totalRecords > 0 &&
            <label className="button-with-text">
              <button className="download-button fail" onClick={this.handleDownloadFail} />
              <FormattedMessage id="progress.download.fail" />
            </label>
          }
        </div>
        <div className="buttons-bar">
          {this.props.done ?
            <button className={this.state.downloading ? "reset-button disabled" : "reset-button"}
                    disabled={this.state.downloading} onClick={this.handleReset}>
              <FormattedMessage id="progress.reset"/>
            </button>
            :
            <button className="reset-button" onClick={this.handleCancel}>
              <FormattedMessage id="progress.cancel"/>
            </button>
          }
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  originalFilename: state.requests && state.requests.originalFilename,
  done: state.requests && state.requests.done,
  stats: state.requests && state.requests.stats,
  results: state.requests && state.requests.results
})

export default connect(mapStateToProps, { clearSession })(injectIntl(Progress))
