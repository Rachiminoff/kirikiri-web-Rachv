import React, {Component, createRef} from "react"
import {withRouter} from "react-router-dom"
import {withOptions} from "../../reader/debug"
import {getResume} from "../../progress/progress"
import {graph, graphR} from "../../resources/generated/scene-index"
import {NumToRoute, RouteToNum} from "../../resources/lookup"
import {RouteOfScene} from "../../resources/titles"
import Arrows from "./arrows/arrows"
import "./graph.css"
import {daysForRoute} from "./route"
import RouteBar from "./routebar/routebar"
import Section from "./section/section"

const empty = {}

const buildLookup = (sceneID, lookupGraph) => {
  return Object.keys(lookupGraph[sceneID] || {}).reduce((acc, sceneKey) => {
    lookupGraph[sceneID][sceneKey].forEach(id => {
      acc[sceneKey] = acc[sceneKey] || {}
      acc[sceneKey][sceneKey + "-" + id] = true
    })
    return acc
  }, {})
}

const sectionIDToDay = (id, lang) => {
  const match = /^(.)(\d*)/.exec(id)
  if (match) {
    if (lang === "jp") {
      return match[1] === "プ" ? "プロローグ" : match[2] + "日目"
    }
    return match[1] === "プ" ? "Prologue"
      : match[2] + ({
      "1": "st",
      "2": "nd",
      "3": "rd",
    }[match[2]] || "th") + " Day"
  }
}

class Graph extends Component {
  constructor(props) {
    super(props)
    this.onMouseOver = this.onMouseOver.bind(this)
    this.selectPane = this.selectPane.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onTouchStart = this.onTouchStart.bind(this)
    this.onTouchEnd = this.onTouchEnd.bind(this)

    props.options.setAutoplay()

    this.relativeRef = createRef()
    this.positions = Object.keys(graph).reduce((acc, key) => {
      acc[key] = createRef()
      return acc
    }, Object.keys(graphR).reduce((acc, key) => {
      if (!acc[key]) {
        acc[key] = createRef()
      }
      return acc
    }, {}))

    this.state = {next: {}, prev: {}, paneMoving: true, mustUpdate: 0}
  }

  componentDidMount() {
    this.setState({ready: true}) // this.positions will now contain the location of each element, need to update the graph
    document.addEventListener("keydown", this.onKeyDown)

    // coming back to the list: show the route that was being read, with the last scene in view
    this.resume = getResume()
    this.pendingScroll = !!this.resume && !this.props.location.hash
    if (this.pendingScroll && !this.props.match.params.route) {
      this.props.history.replace("/" + RouteOfScene(this.resume.id))
    }
    this.redrawLines()
    // line breaks (and so every scene's position) move once the font has arrived
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => this.mounted && this.redrawLines())
    }
    this.mounted = true
  }

  componentWillUnmount() {
    this.mounted = false
    cancelAnimationFrame(this.frame)
    document.removeEventListener("keydown", this.onKeyDown)
  }

  // Draw the lines once the scenes have settled into place (two frames after the last change to the layout).
  redrawLines() {
    cancelAnimationFrame(this.frame)
    this.setState({paneMoving: true})
    this.frame = requestAnimationFrame(() => {
      this.frame = requestAnimationFrame(() => {
        if (!this.mounted) {
          return
        }
        this.setState(prev => ({paneMoving: false, mustUpdate: prev.mustUpdate + 1}), () => this.scrollToResume())
      })
    })
  }

  // once, after the list is drawn: bring the last-read scene into view
  scrollToResume() {
    if (!this.pendingScroll || !this.resume) {
      return
    }
    const ref = this.positions[this.resume.id]
    const el = ref && ref.current
    if (el) {
      this.pendingScroll = false
      el.scrollIntoView({block: "center"})
    }
  }

  // switch to route `num` (0 = Fate, 1 = UBW, 2 = HF)
  selectPane(num) {
    const current = RouteToNum(this.props.match.params.route)
    num = Math.min(2, Math.max(0, num))
    if (num === current) {
      return
    }
    this.pendingScroll = false
    this.props.history.replace("/" + NumToRoute(num))
  }

  // ← / → change route, unless something is being typed into / the menu is open
  onKeyDown(e) {
    const tag = e.target && e.target.tagName
    if (this.props.options.showMenu || tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA" || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
      return
    }
    if (e.target && e.target.closest && e.target.closest(".route-select")) {
      return // the route list handles its own arrow keys
    }
    if (e.key === "ArrowLeft") {
      this.selectPane(RouteToNum(this.props.match.params.route) - 1)
    } else if (e.key === "ArrowRight") {
      this.selectPane(RouteToNum(this.props.match.params.route) + 1)
    }
  }

  // swipe sideways to change route on touch screens
  onTouchStart(e) {
    const t = e.touches[0]
    this.touch = t && {x: t.clientX, y: t.clientY, time: Date.now()}
  }

  onTouchEnd(e) {
    const start = this.touch
    this.touch = null
    const t = e.changedTouches[0]
    if (!start || !t || Date.now() - start.time > 600) {
      return
    }
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 2) {
      this.selectPane(RouteToNum(this.props.match.params.route) + (dx < 0 ? 1 : -1))
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.options.lang !== this.props.options.lang || prevProps.options.h !== this.props.options.h) {
      this.setState({mustUpdate: this.state.mustUpdate + 1})
    }
    if (RouteToNum(prevProps.match.params.route) !== RouteToNum(this.props.match.params.route)) {
      this.redrawLines() // a different route is a different set of scenes
    }
  }

  onMouseOver(sceneID) {
    this.setState({
      hovered: sceneID,
      next: buildLookup(sceneID, graph),
      prev: buildLookup(sceneID, graphR),
    })
  }

  render() {
    const routeNum = RouteToNum(this.props.match.params.route)

    // one column: the days of the chosen route, top to bottom
    const days = daysForRoute(routeNum).map(day => (
      <div key={day.section}
           id={"day-" + day.section}
           className="section-vertical section-day"
           route={day.section[0]}>
        <div className="section-day-descriptor text-shadow">{sectionIDToDay(day.section, this.props.options.lang)}</div>
        <Section section={day}
                 refs={this.positions}
                 hovered={this.state.hovered}
                 hoveredNext={this.state.next[day.section] || empty}
                 hoveredPrev={this.state.prev[day.section] || empty}
                 onMouseOver={this.onMouseOver}
                 onMouseOut={() => this.setState({hovered: null, next: {}, prev: {}})}/>
      </div>
    ))

    return <div className="graph" ref={this.relativeRef} onTouchStart={this.onTouchStart} onTouchEnd={this.onTouchEnd}>
      <RouteBar pane={routeNum}
                lang={this.props.options.lang}
                showH={!!this.props.options.h}
                onSelect={this.selectPane}/>

      {this.relativeRef.current &&
      <Arrows relativeRef={this.relativeRef}
              positions={this.state.ready ? this.positions : {}}
              hovered={this.state.hovered}
              hoveredNext={this.state.next}
              hoveredPrev={this.state.prev}
              pane={routeNum}
              paneMoving={this.state.paneMoving}
              mustUpdate={this.state.mustUpdate}/>}

      {days}
    </div>
  }
}

Graph = withRouter(withOptions(Graph))
export default Graph
