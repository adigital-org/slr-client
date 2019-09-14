import React, { Component } from 'react'
import { injectIntl } from "react-intl"
import MarkdownToJsx from 'markdown-to-jsx'

import './Markdown.sass'

class Markdown extends Component {
  constructor (props) {
    super(props)
    this.state = {
      content: null
    }

    this.fetchManualContent().then(this.setContent)
  }

  setContent = (rawContent) => {
    const phRegex = /%___PLACEHOLDER_((?!___%).)*___%/g
    this.setState({
      content: rawContent.replace(phRegex,
        (ph) => this.props.intl.messages[ph.substring(16, ph.length-4)]
      )
    })
  }

  fetchManualContent = async () => {
    return (await fetch(this.props.content)).text()
  }

  componentDidUpdate = () => {
    if (this.props.jumpToBookmark) this.goToDOMElement(this.props.jumpToBookmark)
  }

  goToDOMElement = (elementName) => {
    const bookmark = document.getElementsByName(elementName)[0]
    if (bookmark) bookmark.scrollIntoView({behavior: "smooth"})
  }

  customImg = ({ ...props }) => {
    const [width, height] = props.src.split(".")[1].split("x")
    //"alt={props.alt}" to prevent warnings in console
    return <img { ...props } alt={props.alt}
                src={require('../static/media/markdown/' + props.src)}
                width={width} height={height} />
  }

  mdOptions = {
    overrides: {
      a: {
        props: {
          target: "_blank",
          rel: "noopener noreferrer"}
      },
      img: this.customImg
    }
  }

  render = () => {
    return (
      <div id="markdown">
        {this.state.content &&
          <MarkdownToJsx options={this.mdOptions}>{this.state.content}</MarkdownToJsx>
        }
      </div>
    )
  }
}

export default injectIntl(Markdown)