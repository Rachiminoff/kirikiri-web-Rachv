import React, {Component} from "react"
import {graph} from "../../../resources/generated/scene-index"
import "./arrows.css"
import Section from "./section/section"

const empty = {}

const linksBySection = {}
Object.keys(graph).forEach((fromID) => {
  const end = graph[fromID]
  Object.keys(end).forEach(toSection => {
    const ids = end[toSection]
    ids.forEach(id => {
      const toID = toSection + "-" + id
      linksBySection[toSection] = linksBySection[toSection] || []
      linksBySection[toSection].push({from: fromID, to: toID})
    })
  })
})

class Arrows extends Component {
  constructor(props) {
    super(props)
    this.mustUpdate = this.mustUpdate.bind(this)
    this.state = {mustUpdate: 0}
  }

  componentDidMount() {
    window.addEventListener("resize", this.mustUpdate)
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.mustUpdate)
  }

  mustUpdate() {
    this.setState({mustUpdate: this.state.mustUpdate + 1})
  }

  render() {
    if (!this.props.relativeRef.current) {
      return null
    }
    const rRect = this.props.relativeRef.current.getBoundingClientRect()

    return <svg className="graph-arrows-svg"
                updating={this.props.paneMoving !== false ? "" : undefined}
                focus={this.props.hovered ? "" : undefined}
                viewBox={"0 0 " + rRect.width + " " + rRect.height}
                ref={this.relativeRef}
                xmlns="http://www.w3.org/2000/svg">
      <defs>
        {[["", "graph-head"], ["-next", "graph-head-next"], ["-prev", "graph-head-prev"]].map(([suffix, cls]) => (
          <marker key={suffix} id={"graph-arrowhead" + suffix} className={cls}
                  viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7"
                  markerUnits="userSpaceOnUse" orient="auto">
            <path d="M1 1.5L9 5L1 8.5Z"/>
          </marker>
        ))}
      </defs>
      {Object.keys(linksBySection).map((sectionID) => (
        <Section sectionID={sectionID}
                 links={linksBySection[sectionID]}
                 hovered={this.props.hovered}
                 hoveredNext={this.props.hoveredNext[sectionID] || empty}
                 hoveredPrev={this.props.hoveredPrev[sectionID] || empty}
                 key={sectionID + (this.state.mustUpdate + this.props.mustUpdate)}
                 rRect={rRect}
                 positions={this.props.positions}
                 updating={this.props.paneMoving}/>
      ))}
    </svg>
  }
}

export default Arrows
