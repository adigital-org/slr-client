import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import Welcome from './Welcome'
import Login from './Login'
import Config from './Config'
import Progress from './Progress'
import Header from './Header'
import Legal from './Legal'
import { checkIfSavedCredentials } from '../store/actions/credentials'

class App extends Component {
  static propTypes = {
    isLoggedIn: PropTypes.bool.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {
      started: false
    }
  }

  componentDidMount() {
    this.props.checkIfSavedCredentials()
  }

  start = () => {
    this.setState({ started: true })
  }

  getLoad() {
    if (!this.props.isLoggedIn && !this.state.started && !this.props.gotCredentials)
      return {component: <Welcome onStart={this.start}/>, help: Welcome.help}
    else if (!this.props.isLoggedIn)
      return {component: <Login />, help: Login.help}
    else if (!this.props.isWorking)
      return {component: <Config />, help: Config.help}
    else
      return {component: <Progress />, help: Progress.help}
  }

  render() {
    const { component, help } = this.getLoad()
    return (
      <div className="container">
        <div className="content card">
          <Header manualBookmark={help} />
          {component}
        </div>
        <Legal />
      </div>
    )
  }
}


const mapStateToProps = (state) => ({
  gotCredentials : state.credentials.saved,
  isLoggedIn: !!(state.credentials && state.credentials.key),
  isWorking: !!state.requests
})

export default connect(mapStateToProps, { checkIfSavedCredentials })(App)
