import React, { Component } from 'react'
import Modal from './Modal'
import {FormattedMessage, injectIntl} from "react-intl"

import './Legal.sass'
import Markdown from "./Markdown"


class Legal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showHelp: false
    }
  }

  handleSwitchHelp = () => {
    this.setState({showHelp: !this.state.showHelp})
  }

  render = () => {
    return (
      <div id="legal">
        <div className="legal-link" onClick={this.handleSwitchHelp}>
          <FormattedMessage id="legal" onClick={this.handleSwitchHelp}/>
        </div>
        <div className="app-version">
          {'v' + this.props.intl.messages.appVersion}
        </div>
        {this.state.showHelp &&
          <Modal onChange={this.handleSwitchHelp}>
            <Markdown content={this.props.intl.messages.markdown.legal} />
          </Modal>
        }
      </div>
    )
  }
}

export default injectIntl(Legal)