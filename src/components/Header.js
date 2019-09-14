import React, { Component } from 'react'
import {injectIntl} from "react-intl"
import Modal from './Modal'
import Markdown from './Markdown'

import slrLogo from '../static/icons/lista-robinson-blue.png'
import './Header.sass'

class Header extends Component {
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
        <div id="header">
          <img className="header-image" src={slrLogo} alt="Lista Robinson logo" />
          <span className="help-button" onClick={this.handleSwitchHelp}>?</span>
          {this.state.showHelp &&
            //<Modal onChange={this.handleSwitchHelp}>{this.props.children}</Modal>
            <Modal onChange={this.handleSwitchHelp}>
              <Markdown
                content={this.props.intl.messages.markdown.manual}
                jumpToBookmark={this.props.manualBookmark}
              />
            </Modal>
          }
        </div>
    )
  }
}

export default injectIntl(Header)