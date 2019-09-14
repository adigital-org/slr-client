import React, { Component } from 'react'
import PropTypes from 'prop-types'

import './ProgressBar.sass'

class ProgressBar extends Component {
  static propTypes = {
    value: PropTypes.number.isRequired
  }

  render = () => {
    return (
      <div id="progress-bar">
        <div className="progress-fill" style={{width: this.props.value + "%"}}>
          {this.props.value + " %"}
        </div>
      </div>
    )
  }
}

export default ProgressBar
