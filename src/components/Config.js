import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import FilePicker from './FilePicker'
import ChannelPicker from './ChannelPicker'
import { startSession } from '../store/actions/requests'
import readLines from '../util/FileLineGenerator'
import { guessChannel } from '../util/SLRUtils'

import './Config.sass'

class Config extends Component {

  constructor (props) {
    super(props)
    this.state = {}
  }

  static help = 'config-help-placeholder'

  handleFile = async (file, totalRecords) => {
    this.setState({ file, totalRecords, channel: null })
    if (file) {
      const lineGenerator = readLines(file)
      const { value } = await lineGenerator.next()
      const guess = value ? guessChannel(value.fields) : null
      this.setState({ channel: guess, guessed: guess })
    }
  }

  handleChannel = (channel) => {
    this.setState({ channel })
  }

  handleStart = () => {
    this.props.startSession(this.state.file, this.state.channel, this.state.totalRecords)
  }

  handleReset = () => {
    this.handleFile()
  }

  render = () => {
    return (
      <div id="main" className="box">
        <h1><FormattedMessage id={this.state.file ? "main.title.set.channel" : "main.title"}/></h1>
        <FilePicker value={this.state.file} onChange={this.handleFile} />
        {this.state.file && (
          <React.Fragment>
            <ChannelPicker value={this.state.channel} guessed={this.state.guessed} onChange={this.handleChannel} />
            {this.state.channel && (
              <div className="buttons-bar">
                <button className="button secondary" type="button" onClick={this.handleReset}>
                  <FormattedMessage id="main.back" />
                </button>
                <button className="button" type="button" onClick={this.handleStart}>
                  <FormattedMessage id="main.start" />
                </button>
              </div>
            )}
          </React.Fragment>
        )}
      </div>
    )
  }
}

export default connect(null, { startSession })(Config)
