import React, {Component} from "react"
import {withRouter} from "react-router-dom"

class Section extends Component {
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (nextProps.updating !== false) {
      return false
    }
    return nextProps.hoveredNext !== this.props.hoveredNext || nextProps.hoveredPrev !== this.props.hoveredPrev || nextProps.updating !== this.props.updating
  }

  render() {
    const rx = -this.props.rRect.left
    const ry = -this.props.rRect.top

    const lines = []
    const borderLines = []
    const linesOnTop = []
    const borderLinesOnTop = []

    this.props.links.forEach((link, linkIndex) => {
      const startRef = this.props.positions[link.from]
      const endRef = this.props.positions[link.to]
      if (startRef && endRef && startRef.current && endRef.current) {
        const startRect = startRef.current.getBoundingClientRect()
        const endRect = endRef.current.getBoundingClientRect()
        // lines leaving the hovered scene are "next", lines arriving at it are "prev"
        const kind = this.props.hovered === link.from ? "next" : this.props.hovered === link.to ? "prev" : undefined
        const highlight = kind !== undefined

        const x1 = rx + startRect.left + startRect.width / 2
        const y1 = ry + startRect.bottom - 2
        const x2 = rx + endRect.left + endRect.width / 2
        const y2 = ry + endRect.top + 2

        // an S-shaped curve that leaves the bottom of one scene straight down and enters the top of the next straight down,
        // so lines fan out smoothly instead of cutting diagonally across the other scenes
        const dy = Math.max(18, Math.abs(y2 - y1) * 0.45)
        const d = "M" + x1 + " " + y1 + " C" + x1 + " " + (y1 + dy) + " " + x2 + " " + (y2 - dy) + " " + x2 + " " + (y2 - 5)

        const border = <path className="graph-svg-line" border=""
                             key={linkIndex + "bg"}
                             highlight={highlight ? "" : undefined}
                             d={d}/>
        const line = <path className="graph-svg-line"
                           key={linkIndex}
                           highlight={highlight ? "" : undefined}
                           kind={kind}
                           markerEnd={"url(#graph-arrowhead" + (kind ? "-" + kind : "") + ")"}
                           d={d}/>
        if (highlight) {
          borderLinesOnTop.push(border)
          linesOnTop.push(line)
        } else {
          borderLines.push(border)
          lines.push(line)
        }
      }
    })

    return borderLines.concat(lines, borderLinesOnTop, linesOnTop)
  }
}

Section = withRouter(Section)
export default Section
