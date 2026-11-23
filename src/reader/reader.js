import React, {Component} from "react"
import {withRouter} from "react-router"
import ScriptLoader from "../interpreter/script-loader"
import Links from "../home/links/links"
import {scripts} from "../resources/generated/scene-index"
import {IDToPath, PathToID} from "../resources/lookup"
import {isRead, setCurrentScene} from "../progress/progress"
import {enterGameScene} from "../progress/game-state"
import {RouteOfScene, SceneTitle} from "../resources/titles"
import Animation from "./animation/animation"
import Choice from "./choice/choice"
import Controls from "./controls/controls"
import {withOptions} from "./debug"
import {NextOf} from "./next"
import "./reader.css"
import {ScrollWatcher, withVn} from "./scroll/watcher"
import {carryModes, enterScene} from "./toast/notice"
import SceneToast from "./toast/scene-toast"

class Reader extends Component {
  constructor(props) {
    super(props)

    this.state = {ready: false}
    this.boxRef = React.createRef()
    this.nextRef = React.createRef()
    this.onEnd = this.onEnd.bind(this)
  }

  sceneID() {
    return this.props.match.params.script ? undefined : PathToID(this.props.match.params)
  }

  componentDidMount() {
    // a scene that follows another one in the reader announces itself (see SceneToast)
    enterGameScene(this.sceneID())
    setCurrentScene(this.sceneID())
    const previous = enterScene(this.sceneID())
    this.setState({progressionReady: true, changedTo: previous && previous !== this.sceneID() ? this.sceneID() : undefined})
  }

  componentDidUpdate(prevProps) {
    const previousID = prevProps.match.params.script ? undefined : PathToID(prevProps.match.params)
    const currentID = this.sceneID()
    if (currentID && currentID !== previousID) {
      enterGameScene(currentID)
      setCurrentScene(currentID)
      this.setState({ready: false})
    }
  }

  // The scene is over and the story carries straight on: go there.  Returns true when it went, "stop" when Skip
  // should not run on (the next scene hasn't been read yet).
  onEnd(modes) {
    const next = NextOf(this.sceneID(), this.props.options.h, this.props.options.mature)
    if (!next || !next.goto) {
      return false
    }
    if (modes.skip && !isRead(next.goto)) {
      return "stop"
    }
    carryModes(modes)
    this.props.history.push("/" + IDToPath(next.goto, this.props.options.lang))
    return true
  }

  render() {
    const options = this.props.options
    const vn = options.readMode !== "scroll"
    const nvl = options.readMode === "nvl"
    const sceneID = this.sceneID()
    const next = sceneID ? NextOf(sceneID, options.h, options.mature) : null
    const hasNext = !!(next && next.goto)
    const script = (
      <ScriptLoader storage={this.props.match.params.script || scripts[PathToID(this.props.match.params)]}
                    onPageReady={() => this.setState({ready: true})}/>
    )

    return (
      <ScrollWatcher key={options.lang + options.readMode}
                     boxRef={this.boxRef}
                     nextRef={this.nextRef}
                     ready={this.state.ready}
                     sceneID={sceneID}
                     hasNext={hasNext}
                     onEnd={this.onEnd}
                     isOnTop={!options.showMenu && !options.showLog && options.canAutoplay}>
        <Animation freezeFrame={!options.canAutoplay}/>

        {vn ?
          <>
            {options.tick}
            <VnChoices nvl={nvl}>
              {this.state.ready && <VnChoice scriptID={PathToID(this.props.match.params)}/>}
            </VnChoices>
            <SceneToast title={this.state.changedTo ? SceneTitle(this.state.changedTo, options.lang) : ""}
                        noticeKey={this.state.changedTo}/>
            <VnBox hide={!options.canAutoplay ? "" : undefined} nvl={nvl}>
              <div className="vn-scroller" ref={this.boxRef}>
                <div className="text text-shadow">
                  {script}
                </div>
              </div>
              <VnNext nextRef={this.nextRef} more={hasNext}/>
              <VnLoading/>
              <Controls scenesTo={"/" + RouteOfScene(sceneID)} sceneID={sceneID} lang={options.lang}/>
            </VnBox>
          </> :
          <div className="text-area" hide={!options.canAutoplay ? "" : undefined}>
            {options.tick}
            <div className="text text-shadow resizable-text">
              {script}
              {this.state.ready && <Choice scriptID={PathToID(this.props.match.params)}/>}
            </div>
          </div>
        }

        <div className="click-to-start resizable-text"
             hide={options.canAutoplay ? "" : undefined}
             onClick={options.setAutoplay}>
          <Links/>
          <div>
            <div>Click to start</div>
            Press &lt;ESC&gt; to adjust settings
          </div>
          <div>
            <div>Tap to start</div>
            Press tick to adjust settings
          </div>
        </div>
      </ScrollWatcher>
    )
  }
}

// choices are only offered once the reader has reached the end of the script (when the story has one way on, the
// reader simply carries on into the next scene, so there is nothing to press)
const VnChoice = withVn(props => props.vn.atEnd ? <Choice scriptID={props.scriptID} choicesOnly/> : null)

// the text box; its text stays concealed until the section's picture is ready, and the whole thing can be hidden
const VnBox = withOptions(withVn(props => (
  <div className={"vn-box" + (props.nvl ? " nvl" : " resizable-text")}
       style={{"--vn-alpha": props.options.boxOpacity}}
       hide={props.hide}
       concealed={props.vn.shown ? undefined : ""}
       ui-hidden={props.vn.uiHidden ? "" : undefined}>
    {props.children}
  </div>
)))

const VnChoices = withVn(props => (
  <div className={"vn-choices text-shadow" + (props.nvl ? " nvl" : " resizable-text")} ui-hidden={props.vn.uiHidden ? "" : undefined}>
    {props.children}
  </div>
))

// the little "more to read" marker in the corner of the text box
// (in NVL mode the watcher moves it to sit right after the last character on the page)
const VnNext = withVn(props => <div className="vn-next" ref={props.nextRef} hide={(props.vn.atEnd && !props.more) || !props.vn.shown ? "" : undefined}/>)

// a small pulsing diamond while a scene's picture and sound are still loading (clicks wait for them)
const VnLoading = withVn(props => <div className="vn-loading" hide={props.vn.loading ? undefined : ""} aria-hidden="true"/>)

Reader = withOptions(withRouter(Reader))
export default Reader
