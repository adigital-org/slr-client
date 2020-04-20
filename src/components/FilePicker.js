import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, FormattedTime, FormattedNumber } from 'react-intl'
import Config from '../config'
import Spinner from './Spinner'
import { countLines } from '../util/FileLineGenerator'

import './FilePicker.sass'

class FilePicker extends Component {
  static propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)

    /*
      fileSizeState:
        -1 = not computed yet
         0 = normal
         1 = big
         2 = file is too big
   */
    this.state = {
      preselected: null,
      linesCounted: -1,
      fileSizeState: -1,
      error: false
    }
    this.picker = React.createRef()
  }

  componentDidMount = () => {
    window.addEventListener('drop', this.handleDrop)
    window.addEventListener('dragover', this.handleDragOver)
    window.addEventListener('dragleave', this.handleDragLeave)
  }

  componentWillUnmount = () => {
    window.removeEventListener('drop', this.handleDrop)
    window.addEventListener('dragover', this.handleDragOver)
    window.addEventListener('dragleave', this.handleDragLeave)
  }

  handleDragOver = (e) => {
    e.preventDefault()
    if (e.dataTransfer && e.dataTransfer.types.length > 0 && e.dataTransfer.types.includes("Files"))
    this.setState({dragging: true})
  }

  handleDragLeave = (e) => {
    if (e.dataTransfer && e.pageX !== 0 && e.pageY !== 0) return
    this.setState({dragging: false})
  }

  handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.types.length > 0 && e.dataTransfer.types.includes("Files")) {
      this.setState({ dragging: false })
      this.handleUnpick()
      this.preselectFile(e.dataTransfer.files[0])
    }
  }

  handlePick = (e) => {
    e.target.files.length > 0 && this.preselectFile(e.target.files[0])
  }

  preselectFile(file) {
    const ext = file.name.split(".").slice(-1)[0].toLowerCase()
    if (!Config.supportedExtensions.includes(ext)) return this.setState({error: true})

    this.setState({
      preselected: file,
      error: false
    })
    countLines(file)
      .then((lines) => {
        this.setState({
          linesCounted: lines,
          fileSizeState: this.fileSizeStateSelector(this.state.preselected.size, lines)
        })
      })
      .catch(error => this.setState({ preselected: null, error }))
  }
  fileSizeStateSelector = (fileSize, linesCounted) => {
    if (window.electronFs) return 0 // Disable alerts on Electron environment
    const estimation = fileSize + linesCounted*Config.signatureSize*1.1
    if (estimation > Config.maxEstimatedSize) return 2 //File too big
    if (linesCounted > Config.fileRecordsAlert) return 1 //Big file
    return 0 //Normal file
  }


  pickFile = () => {
    this.picker.current && this.picker.current.click()
  }

  handleSetFile = () => {
    this.props.onChange(this.state.preselected, this.state.linesCounted)
  }

  handleUnpick = () => {
    this.picker.current.value = ''
    this.setState({
      preselected: null,
      linesCounted: -1,
      fileSizeState: -1
    })

    this.props.onChange()
  }

  render = () => {
    return (
      <div id="file-picker" className={!this.props.value ? "expand" : ""}>
        <input className="hidden-file" type="file"
          ref={this.picker} onChange={this.handlePick} />

        {!this.props.value && !this.state.preselected && (
          <label>
            <FormattedMessage id="main.select" />
            <div className="upload-button">
              <button type="button" className="file-button" onClick={this.pickFile} />
              <FormattedMessage id="main.select-cta" />
              <div className={this.state.error ? "file-error" : "file-error hidden"}>
                {this.state.error === true &&
                  <FormattedMessage id="main.select.error" />
                }
                {this.state.error && this.state.error !== true &&
                  <>
                    <FormattedMessage id="main.selected.scanning.error" />
                    <div className="details">{this.state.error.message}</div>
                  </>
                }
              </div>
            </div>
          </label>
        )}
        {!this.props.value && this.state.preselected && (
          <div className="file-preview">
            {this.state.linesCounted === -1 ?
                <div className="file-preview-info">
                  <div className="file-preview-scanning">
                    <Spinner />
                    <FormattedMessage id="main.selected.scanning" />
                  </div>
                </div>
                :
                <div className="file-preview-info">
                  <div className="file-preview-info-metadata">
                    <ul className="table">
                      <li>
                        <FormattedMessage id="main.selected.name" />
                        <span className="file-metadata">{this.state.preselected.name}</span>
                      </li>
                      <li>
                        <FormattedMessage id="main.selected.edit" />
                        <span className="file-metadata">
                          <FormattedTime value={this.state.preselected.lastModified}
                          year="numeric" month="numeric" day="numeric" />
                        </span>
                      </li>
                      <li>
                        <FormattedMessage id="main.selected.records" />
                        <span className="file-metadata">
                          <FormattedNumber value={this.state.linesCounted} />
                        </span>
                      </li>
                    </ul>
                    <div className={
                      this.state.fileSizeState === 2 ? "size-alert error-icon" :
                        this.state.fileSizeState === 1 ? "size-alert warning-icon" :
                          "size-alert hidden"
                    }>
                      {this.state.fileSizeState === 1 ?
                        <FormattedMessage id="main.selected.bigAlert"/> :
                        <FormattedMessage id="main.selected.tooBig"/>
                      }
                    </div>
                  </div>
                  <div className="buttons-bar">
                    <button type="button" className="secondary" onClick={this.handleUnpick}>
                      <FormattedMessage id="main.replace-cta" />
                    </button>
                    <button type="button" className={this.state.fileSizeState === 2 ? "disabled" : ""}
                            onClick={this.state.fileSizeState === 2 ? null : this.handleSetFile}>
                      <FormattedMessage id="main.selected.setAndNext" />
                    </button>
                  </div>
                </div>
            }
          </div>
        )}

        {this.props.value && (
          <div className="selected-file">
            <FormattedMessage id="main.selected" />
            <div className="info-wrapper">
              <div className="info">
                <span className="filename">{this.props.value.name}</span>
                <span className="date">
                  {new Date(this.props.value.lastModified).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
        {this.state.dragging && (
          <div id="drop-area" onClick={this.handleDragLeave}>
            <FormattedMessage id="main.drop" />
          </div>
        )}
      </div>
    )
  }
}

export default FilePicker
