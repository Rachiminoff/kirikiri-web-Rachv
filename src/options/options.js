import React, {Component} from "react"
import Backlog from "../reader/backlog/backlog"
import {Provider} from "../reader/debug"
import Menu from "./menu/menu"
import MobileGuard from "./mobile/mobile-guard"
import Tick from "./tick/tick"

const getOptions = (s) => ({
  bgm: s.bgm / 100,
  voice: s.voice / 100,
  sound: s.sound / 100,
  bgmVersion: s.bgmVersion,
  lang: s.lang,
  mature: s.mature,
  h: s.h,
  readMode: s.readMode,
  autoSpeed: s.autoSpeed,
  boxOpacity: s.boxOpacity / 100,
  landscape: s.landscape,
  fontFamily: s.fontFamily,
  fontSize: s.fontSize,
  keyNext: s.keyNext,
  keyPrevious: s.keyPrevious,
  keyAuto: s.keyAuto,
  keySkip: s.keySkip,
  keyHide: s.keyHide,
  keyBacklog: s.keyBacklog,
  debugLevel: s.debugLevel,
})

class Options extends Component {
  constructor(props) {
    super(props)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.setSaveState = this.setSaveState.bind(this)
    this.setAutoplay = this.setAutoplay.bind(this)

    const cookies = document.cookie
    const debug = /debug=(\d)(?:;|$)/.exec(cookies) || {}
    const bgm = /bgm=([^;]*)(?:;|$)/.exec(cookies) || {}
    const voice = /voice=([^;]*)(?:;|$)/.exec(cookies) || {}
    const sound = /sound=([^;]*)(?:;|$)/.exec(cookies) || {}
    const bgmVersion = /bgmVersion=([^;]*)(?:;|$)/.exec(cookies) || {}
    const lang = /lang=([^;]*)(?:;|$)/.exec(cookies) || {}
    const mature = /mature=([^;]*)(?:;|$)/.exec(cookies) || {}
    const h = /h=([^;]*)(?:;|$)/.exec(cookies) || {}
    const readMode = /readMode=([^;]*)(?:;|$)/.exec(cookies) || {}
    const autoSpeed = /autoSpeed=([^;]*)(?:;|$)/.exec(cookies) || {}
    const boxOpacity = /boxOpacity=([^;]*)(?:;|$)/.exec(cookies) || {}
    const landscape = /landscape=([^;]*)(?:;|$)/.exec(cookies) || {}
    const fontFamily = /fontFamily=([^;]*)(?:;|$)/.exec(cookies) || {}
    const fontSize = /fontSize=([^;]*)(?:;|$)/.exec(cookies) || {}
    const keyNext = /keyNext=([^;]*)(?:;|$)/.exec(cookies) || {}
    const keyPrevious = /keyPrevious=([^;]*)(?:;|$)/.exec(cookies) || {}
    const keyAuto = /keyAuto=([^;]*)(?:;|$)/.exec(cookies) || {}
    const keySkip = /keySkip=([^;]*)(?:;|$)/.exec(cookies) || {}
    const keyHide = /keyHide=([^;]*)(?:;|$)/.exec(cookies) || {}
    const keyBacklog = /keyBacklog=([^;]*)(?:;|$)/.exec(cookies) || {}

    this.state = {
      showMenu: false,
      showLog: false,
      canAutoplay: false,
      debugLevel: parseInt(debug[1], 10) || 0,
      bgm: bgm[1] ? parseInt(bgm[1], 10) : 50,
      voice: voice[1] ? parseInt(voice[1], 10) : 50,
      sound: sound[1] ? parseInt(sound[1], 10) : 50,
      bgmVersion: bgmVersion[1] || "vita",
      lang: lang[1] || "eng",
      mature: !(mature[1] === "false"),
      h: parseInt(h[1], 10) || 0,
      // "nvl" = click / key to advance through full-screen text laid over the picture (default),
      // "vn" = the same, but in a textbox along the bottom, "scroll" = original scrolling page
      readMode: ["vn", "scroll"].includes(readMode[1]) ? readMode[1] : "nvl",
      autoSpeed: ["slow", "fast"].includes(autoSpeed[1]) ? autoSpeed[1] : "normal",
      landscape: !(landscape[1] === "false"), // phones: ask for fullscreen + landscape while reading
      boxOpacity: boxOpacity[1] ? Math.min(100, Math.max(20, parseInt(boxOpacity[1], 10) || 80)) : 80,
      fontFamily: (() => { try { return fontFamily[1] ? decodeURIComponent(fontFamily[1]) : "FateLine" } catch (e) { return "FateLine" } })(),
      fontSize: fontSize[1] ? Math.min(150, Math.max(80, parseInt(fontSize[1], 10) || 100)) : 100,
      keyNext: keyNext[1] || "ArrowRight",
      keyPrevious: keyPrevious[1] || "ArrowLeft",
      keyAuto: keyAuto[1] || "KeyA",
      keySkip: keySkip[1] || "ControlLeft",
      keyHide: keyHide[1] || "KeyH",
      keyBacklog: keyBacklog[1] || "KeyL",
    }
    this.state.options = getOptions(this.state)
    this.applyReaderPreferences(this.state)
  }

  applyReaderPreferences(state) {
    if (typeof document === "undefined") return
    const fonts = {FateLine: "FateLine", Georgia: "Georgia, serif", Arial: "Arial, sans-serif", Verdana: "Verdana, sans-serif", "Times New Roman": "'Times New Roman', serif"}
    document.documentElement.style.setProperty("--reader-font-family", fonts[state.fontFamily] || fonts.FateLine)
    document.documentElement.style.setProperty("--reader-font-scale", String((state.fontSize || 100) / 100))
  }

  componentDidMount() {
    this.applyReaderPreferences(this.state)
    // document.addEventListener("click", this._handleDocumentClick, false)
    document.addEventListener("keydown", this.onKeyDown)
  }

  componentWillUnmount() {
    // document.removeEventListener("click", this._handleDocumentClick, false)
    document.removeEventListener("keydown", this.onKeyDown)
  }

  onKeyDown(e) {
    if (e.target && e.target.tagName === "SELECT") return
    if (this.state.showLog) { // the backlog is open: Esc / L close it, nothing else reaches the reader or the menu
      if (e.keyCode === 27 || e.code === this.state.keyBacklog) {
        e.preventDefault()
        // (deferred, like the menu below: the reader's own key listener runs after this one and must still see the log as open)
        setTimeout(() => this.setState({showLog: false}), 1)
      }
      return
    }
    if (e.keyCode === 27) { // escape
      setTimeout(() => {
        if (this.state.showMenu) {
          this.setState({canAutoplay: true})
        }
        this.setState({
          showMenu: !this.state.showMenu,
          options: getOptions(this.state),
        })
      }, 1)
    } else if (e.keyCode === 13) { // enter
      setTimeout(() => {
        this.setState({canAutoplay: true})
        if (this.state.showMenu) {
          this.setState({
            showMenu: false,
            options: getOptions(this.state),
          })
        }
      }, 1)
    } else if (e.keyCode === 192) { // tilda / back-tick
      this.setState(prevState => {
        const debugLevel = (prevState.debugLevel + 1) % 3
        document.cookie = "debug=" + debugLevel + ";SameSite=Strict"
        return {debugLevel: debugLevel}
      })
    }
  }

  setSaveState(val) {
    this.setState(val)

    // these take effect immediately, so the change can be heard / seen while adjusting.
    // (everything else applies when the menu closes, since changing it reloads the reader)
    const live = ["bgm", "voice", "sound", "autoSpeed", "boxOpacity", "landscape"]
    if (Object.keys(val).every(key => live.includes(key))) {
      this.setState(prev => ({options: getOptions(Object.assign({}, prev, val))}))
    }

    const expires = ";SameSite=Strict;path=/;expires=" + new Date().setFullYear(new Date().getFullYear() + 10)
    const state = Object.assign({}, this.state, val)
    document.cookie = "bgm=" + state.bgm + expires
    document.cookie = "voice=" + state.voice + expires
    document.cookie = "sound=" + state.sound + expires
    document.cookie = "bgmVersion=" + state.bgmVersion + expires
    document.cookie = "lang=" + state.lang + expires
    document.cookie = "mature=" + state.mature + expires
    document.cookie = "h=" + state.h + expires
    document.cookie = "readMode=" + state.readMode + expires
    document.cookie = "autoSpeed=" + state.autoSpeed + expires
    document.cookie = "boxOpacity=" + state.boxOpacity + expires
    document.cookie = "landscape=" + state.landscape + expires
    ;["fontFamily", "fontSize", "keyNext", "keyPrevious", "keyAuto", "keySkip", "keyHide", "keyBacklog"].forEach(key => {
      document.cookie = key + "=" + encodeURIComponent(state[key]) + expires
    })
    this.applyReaderPreferences(state)
  }

  setAutoplay() {
    this.setState({canAutoplay: true})
  }

  render() {
    return <Provider value={Object.assign({}, this.state.options, {
      debugLevel: this.state.debugLevel,
      showMenu: this.state.showMenu,
      canAutoplay: this.state.canAutoplay,
      setAutoplay: this.setAutoplay,
      showLog: this.state.showLog,
      openMenu: () => this.setState({showMenu: true, canAutoplay: true}),
      openLog: () => this.setState({showLog: true, showMenu: false, canAutoplay: true}),
      tick: <Tick onClick={() => this.setState({showMenu: true, canAutoplay: true})}/>,
    })}>
      {this.props.children}

      <MobileGuard/>

      <Backlog visible={this.state.showLog}
               lang={this.state.lang}
               onClose={() => this.setState({showLog: false})}/>

      <Menu visible={this.state.showMenu}
            openLog={() => this.setState({showLog: true, showMenu: false, canAutoplay: true})}
            setSaveState={this.setSaveState}
        // the setTimeout here is a terrible hack, it avoids timing issues since we currently have multiple listeners for the same key
            onClose={() => setTimeout(() => this.setState({
              showMenu: false,
              canAutoplay: true,
              options: getOptions(this.state),
            }), 1)}
            {...this.state}/>
    </Provider>
  }
}

export default Options
