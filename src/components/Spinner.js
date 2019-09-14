import React, { Component } from 'react'

import './Spinner.sass'


/*
  https://github.com/loadingio/css-spinner/
 */
class Spinner extends Component {
  render = () => {
    return (
      <div className="lds-ellipsis">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    )
  }
}

export default Spinner
