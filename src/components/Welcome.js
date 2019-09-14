import React, { Component } from 'react'
import {FormattedMessage, injectIntl} from "react-intl"

import './Welcome.sass'

class Welcome extends Component {
  render = () => {
    return (
      <div id="welcome" className="box">
        <h1><FormattedMessage id="welcome.title" /></h1>
        <div className="expander">
          <div className="message">
            <FormattedMessage id="welcome.intro" />
            <FormattedMessage id="welcome.getHelp" />
          </div>
          <div className="buttons-bar">
            <button onClick={this.props.onStart}><FormattedMessage id="welcome.start" /></button>
          </div>
        </div>
      </div>
    )
  }
}

export default injectIntl(Welcome)