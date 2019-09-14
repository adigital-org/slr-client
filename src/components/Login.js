import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { injectIntl, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'

import {
  addCredentials,
  unlockSavedCredentials,
  clearSavedCredentials
} from '../store/actions/credentials'

import './Login.sass'

class Login extends Component {

  static propTypes = {
    addCredentials: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)

    let key = ''
    let secret = ''
    /* global givenCredentials */
    if (givenCredentials !== null) {
      key = givenCredentials.key
      secret = givenCredentials.secret
    }

    this.state = {
      key: key,
      secret: secret,
      remember: false,
      rememberPass: ''
    }
  }

  static help = 'login-help-placeholder'

  handleKey = (e) => this.setState({ key: e.target.value })
  handleSecret = (e) => this.setState({ secret: e.target.value })
  handleRemember = (e) => this.setState({ remember: e.target.checked })
  handleRememberPass = (e) => this.setState({ rememberPass: e.target.value })

  handleLogin = (e) => {
    e.preventDefault()
    const { key, secret, remember, rememberPass } = this.state
    this.setState({ loading: true, error: false })
    this.props.addCredentials(key, secret, remember && rememberPass)
      .catch(() => this.setState({ loading: false, error: true }))
  }

  handleUnlock = (e) => {
    e.preventDefault()
    const rememberPass = this.state.rememberPass
    this.props.unlockSavedCredentials(rememberPass)
      .catch(() => this.setState({ loading: false, error: true }))
  }

  handleForget = () => {
    const msg = this.props.intl.formatMessage({
      id: 'login.unlock.forget-confirm'
    })
    window.confirm(msg) && this.props.clearSavedCredentials()
  }

  renderUnlock() {
    return (
      <div id="login" className="box unlock">
        <h1><FormattedMessage id="login.title.unlock" /></h1>
        <form onSubmit={this.handleUnlock}>
          <div className="form-body">
            <p  className="login-message">
              <FormattedMessage id="login.unlock.descr" />
            </p>
            <label className="unlock-pass">
              <FormattedMessage id="login.unlock.pass" />
              <input type="password" name="unlock-pass" required autoFocus
                value={this.state.rememberPass} onChange={this.handleRememberPass}
                autoComplete="off"
              />
            </label>
            <div className={this.state.error ? "error" : "error hidden"}>
              <FormattedMessage id="login.error" />
            </div>
          </div>
          <div className="buttons-bar">
            <button type="button" className="secondary"
                    onClick={this.handleForget}>
              <FormattedMessage id="login.unlock.forget" />
            </button>
            <button type="submit">
              <FormattedMessage id="login.unlock.unlock" />
            </button>
          </div>
        </form>
      </div>
    )
  }

  renderLogin() {
    const isLoading = this.state.loading
    return (
      <div id="login" className="box login">
        <h1><FormattedMessage id="login.title" /></h1>
        <form onSubmit={this.handleLogin}>
          <div className="form-body">
            <p className="login-message">
              <FormattedMessage id="login.message" />
            </p>
            <label className="key">
              <FormattedMessage id="login.key" />
              <input name="key" autoComplete="off" required autoFocus
                value={this.state.key} onChange={this.handleKey}
                disabled={isLoading} />
            </label>
            <label className="secret">
              <FormattedMessage id="login.secret" />
              <input name="secret" autoComplete="off" required
                value={this.state.secret} onChange={this.handleSecret}
                disabled={isLoading} />
            </label>
            <label className="remember">
              <input name="remember" type="checkbox" disabled={isLoading}
                checked={this.state.remember} onChange={this.handleRemember} />
              <FormattedMessage id="login.remember-me" />
            </label>
            {this.state && (
              <label className={this.state.remember ? "remember-pass" : "remember-pass hidden"}>
                <FormattedMessage id="login.remember-pass" />
                <input type="password" name="remember-pass" required={this.state.remember}
                  value={this.state.rememberPass}
                  onChange={this.handleRememberPass}
                  disabled={isLoading} autoComplete="off"
                />
              </label>
            )}
            <div className={this.state.error ? "error" : "error hidden"}>
              <FormattedMessage id="login.error" />
            </div>
          </div>
          <div className="hint">
            <FormattedMessage id="login.getCredentials" />
            <a target="_blank" rel="noopener noreferrer" href={this.props.intl.messages.appSlrHomeUrl + this.props.intl.messages.appSlrGetKeysUrl} >
              <FormattedMessage id="login.getCredentials.link" />
            </a>.
          </div>
          <div className="buttons-bar">
            <button type="submit" disabled={isLoading}>
              <FormattedMessage id={isLoading ? 'loading' : 'login.cta'} />
            </button>
          </div>
        </form>
      </div>
    )
  }

  render() {
    return this.props.savedPass ? this.renderUnlock() : this.renderLogin()
  }
}

const mapStateToProps = (state) => ({
  savedPass: state.credentials && state.credentials.saved
})

const mapDispatchToProps = {
  addCredentials,
  unlockSavedCredentials,
  clearSavedCredentials
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Login))
