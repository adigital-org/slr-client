import React, { Component } from 'react'

import './Modal.sass'

class Modal extends Component {
  handleClose = () => {
    this.props.onChange(false)
  }

  render = () => {
    return (
      <div id="modal-wrapper" onClick={this.handleClose}>
        <div className="modal-card card" onClick={(e)=>e.stopPropagation()}>
          <span className="modal-close" onClick={this.handleClose}>×</span>
          <div className="modal-content">
            {this.props.children}
          </div>
        </div>
      </div>
    )
  }
}

export default Modal