import React, {Component} from "react"
import {getPlaytime} from "../../progress/progress"
import {withOptions} from "../debug"
import {withVn} from "../scroll/watcher"
import "./controls.css"

const Icon = ({children}) => (
  <svg viewBox="0 0 24 24" width="1.25em" height="1.25em" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

const Button = ({label, shortcut, active, onClick, children}) => (
  <button type="button"
          className="vn-btn"
          aria-pressed={active === undefined ? undefined : active}
          title={label + (shortcut ? " (" + shortcut + ")" : "")}
          onClick={onClick}>
    <Icon>{children}</Icon>
    <span>{label}</span>
  </button>
)

// the row of quick buttons under the text: back, auto, skip, log, hide, settings
const displayKey = code => ({ControlLeft: "Ctrl", ArrowRight: "→", ArrowLeft: "←", ArrowUp: "↑", ArrowDown: "↓", Space: "Space", Enter: "Enter"}[code] || (code || "").replace(/^Key/, ""))

const formatPlaytime = milliseconds => {
  const total = Math.floor(milliseconds / 1000)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  return [hours, minutes, seconds].map(value => (value < 10 ? "0" : "") + value).join(":")
}

class Playtime extends Component {
  constructor(props) { super(props); this.state = {elapsed: getPlaytime()} }
  componentDidMount() { this.timer = setInterval(() => this.setState({elapsed: getPlaytime()}), 1000) }
  componentWillUnmount() { clearInterval(this.timer) }
  render() { return <span className="vn-playtime" title="Total reading time">{formatPlaytime(this.state.elapsed)}</span> }
}

const Controls = props => {
  const {actions = {}, auto, skip} = props.vn || {}
  const options = props.options || {}
  if (options.showMenu || options.showPause || options.showLog) {
    return null
  }
  return <>
    <div className="vn-bar" role="toolbar" aria-label="Reading controls">
      <Playtime/>
      <Button label="Back" shortcut={displayKey(options.keyPrevious || "ArrowLeft")} onClick={actions.back}>
        <path d="M9 14L4 9l5-5"/>
        <path d="M4 9h10a6 6 0 0 1 0 12h-3"/>
      </Button>
      <Button label={auto ? "Auto On" : "Auto"} shortcut={displayKey(options.keyAuto || "KeyA")} active={auto} onClick={actions.toggleAuto}>
        <path d="M7 4.5v15l12-7.5z"/>
      </Button>
      <Button label={skip ? "Skip On" : "Skip"} shortcut={displayKey(options.keySkip || "KeyS")} active={skip} onClick={actions.toggleSkip}>
        <path d="M4 5v14l8-7zM12 5v14l8-7z"/>
      </Button>
      <Button label="Log" shortcut={displayKey(options.keyBacklog || "KeyL")} onClick={actions.openLog}>
        <path d="M5 4h14v16H5z"/>
        <path d="M8.5 9h7M8.5 12.5h7M8.5 16h4"/>
      </Button>
      <Button label="Hide" shortcut={displayKey(options.keyHide || "KeyH")} onClick={actions.toggleHide}>
        <path d="M3 12s3.5-6.5 9-6.5S21 12 21 12s-3.5 6.5-9 6.5S3 12 3 12z"/>
        <circle cx="12" cy="12" r="2.8"/>
      </Button>
      <Button label="Pause" shortcut="Esc" onClick={options.openPause}>
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/>
      </Button>
    </div>
  </>
}

export default withOptions(withVn(Controls))
