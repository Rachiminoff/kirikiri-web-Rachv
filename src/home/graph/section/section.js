import React, {Component} from "react"
import {Link, withRouter} from "react-router-dom"
import {getResume, isRead} from "../../../progress/progress"
import {withOptions} from "../../../reader/debug"
import {scripts} from "../../../resources/generated/scene-index"
import {IDToPath} from "../../../resources/lookup"
import "./section.css"

const hRegex = /^[^-]+-1\d\d$/

class Section extends Component {
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return nextProps.hoveredNext !== this.props.hoveredNext || nextProps.hoveredPrev !== this.props.hoveredPrev ||
      nextProps.options.lang !== this.props.options.lang || nextProps.options.h !== this.props.options.h
  }

  render() {
    const resume = getResume()
    const resumeID = resume && resume.id
    const addArray = (array, direction) => array.map((elem, elemIndex) => {
      if (elem.id) {
        const h = hRegex.test(elem.id)
        return (!h || !!this.props.options.h) &&
          <Link key={elemIndex}
                className="graph-item"
                h={h ? "" : undefined}
                style={this.props.options.debugLevel ? {backgroundColor: scripts[elem.id] ? undefined : "red"} : {}}
                to={"/" + (scripts[elem.id] ? IDToPath(elem.id, this.props.options.lang) : elem.id)}
                ref={this.props.refs[elem.id]}
                read={isRead(elem.id) ? "" : undefined}
                resume={resumeID === elem.id ? "" : undefined}
                hovered={this.props.hovered === elem.id ? "" : undefined}
                next={this.props.hoveredNext[elem.id] ? "" : undefined}
                prev={this.props.hoveredPrev[elem.id] ? "" : undefined}
                onMouseOver={() => this.props.onMouseOver(elem.id)}
                onMouseOut={this.props.onMouseOut}
                onFocus={() => this.props.onMouseOver(elem.id)}
                onBlur={this.props.onMouseOut}>
            {elem[this.props.options.lang]}
          </Link>
      } else if (elem.v) {
        return <div key={elemIndex} className="section-vertical">
          {addArray(elem.v, "v")}
        </div>
      } else if (elem.h) {
        return <div key={elemIndex} className="section-horizontal">
          {addArray(elem.h, "h")}
        </div>
      } else {
        throw new Error("unexpected element:" + elem)
      }
    })

    return addArray(this.props.section.v)
  }
}

Section = withOptions(withRouter(Section))
export default Section
