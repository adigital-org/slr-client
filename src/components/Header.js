import React, { Component } from 'react'
import {injectIntl} from "react-intl"
import Modal from './Modal'
import Markdown from './Markdown'
import needUpdate from '../util/VersionChecker'

import slrLogo from '../static/icons/lista-robinson-blue.png'
import './Header.sass'
import Config from '../config'

class Header extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showHelp: false,
      showDesktop: false,
      appUpdate: false
    }
  }

  componentDidMount = () => {
    if (window.electronFs) {
      needUpdate(Config.latestVersionCheckUrl, Config.messages.appVersion).then(
        (update) => {if (update) this.setState({appUpdate: true})}
      )
    }
  }

  handleSwitchHelp = () => {
    this.setState({showHelp: !this.state.showHelp})
  }

  handleSwitchDesktop = () => {
    this.setState({showDesktop: !this.state.showDesktop})
  }

  render = () => {
    return (
        <div id="header">
          <img className="header-image" src={slrLogo} alt="Lista Robinson logo" />
          <span className="button-bar">
            <span className="desktop-button"
                  title={this.state.appUpdate ?
                    this.props.intl.messages['header.desktop.update'] :
                    this.props.intl.messages['header.desktop']}
                  onClick={this.handleSwitchDesktop}>
              {this.state.appUpdate &&
                <span className="desktop-button-alert">!</span>
              }
            </span>
            <span className="help-button" title={this.props.intl.messages['header.help']} onClick={this.handleSwitchHelp}>?</span>
          </span>
          {this.state.showHelp &&
            <Modal onChange={this.handleSwitchHelp}>
              <Markdown
                content={this.props.intl.messages.markdown.manual}
                jumpToBookmark={this.props.manualBookmark}
              />
            </Modal>
          }
          {this.state.showDesktop &&
          <Modal onChange={this.handleSwitchDesktop}>
            <Markdown
              content={this.props.intl.messages.markdown.desktop}
            />
          </Modal>
          }
        </div>
    )
  }
}

export default injectIntl(Header)