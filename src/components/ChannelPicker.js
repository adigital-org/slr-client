import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import { channels } from '../util/SLRUtils'

import './ChannelPicker.sass'

class ChannelPicker extends Component {
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired
  }

  handleClick = (rule, check) => () => {
    if (this.props.guessed && rule !== this.props.guessed && check) {
      const guessedFileType = this.props.intl.formatMessage({
        id: 'main.options.type.' + channels[this.props.guessed].fileType
      })
      const msg = this.props.intl.formatMessage({
        id: 'main.options.type.changeAgainstGuesser'
      }, {fileType: guessedFileType.toLowerCase()})

      window.confirm(msg) && this.props.onChange(rule)
    }
    else this.props.onChange(rule)
    document.activeElement.blur()
  }

  compatibleFileTypes = Object.keys(channels).reduce((rules, rule) => {
    rules[channels[rule].fileType] === undefined ?
      rules[channels[rule].fileType] = [rule] :
      rules[channels[rule].fileType].push(rule)
    return rules
  }, [])

  fileTypeCampaigns = Object.keys(channels).reduce((rules, rule) => {
    rules[channels[rule].fileType] === undefined ?
      rules[channels[rule].fileType] = [channels[rule].campaign] :
      rules[channels[rule].fileType].push(channels[rule].campaign)
    return rules
  }, [])

  render = () => {
    return (
      <div id="channel-picker">
        <FormattedMessage id="main.options.type" />
        <div className="channels">
          {Object.keys(this.compatibleFileTypes).map((fileType) =>
            <button className={this.compatibleFileTypes[fileType].includes(this.props.value) ?
              "button start file-type file-type-selected" :
              "button start file-type"
            } type="button" key={fileType} onClick={
              this.handleClick(this.compatibleFileTypes[fileType][0], true)
            }>
              <FormattedMessage id={'main.options.type.' + fileType} />
            </button>
          )}
        </div>

        {this.props.value &&
          this.fileTypeCampaigns[channels[this.props.value].fileType].length > 1 &&
        <div className="campaign">
          <FormattedMessage id="main.options.type.Campaign" />
          <div className="campaign-buttons">

            {this.fileTypeCampaigns[channels[this.props.value].fileType].map((campaign, index) =>
              <button className={channels[this.props.value].campaign === campaign ?
                "button start campaign-type file-type-selected" : "button start campaign-type"
              } type="button" key={campaign} onClick={this.handleClick(
                this.compatibleFileTypes[channels[this.props.value].fileType][index]
              )}>
                <FormattedMessage id={"main.options.type.Campaign." + campaign} />
              </button>
            )}

          </div>
        </div>
        }

      </div>

    )
  }
}

export default injectIntl(ChannelPicker)
