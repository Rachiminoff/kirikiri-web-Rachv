import React, {Component} from "react"
import {isMobileDevice} from "../../options/mobile/mobile"
import "./introduction.css"

class Introduction extends Component {
  constructor(props) {
    super(props)

    this.updateCookie = this.updateCookie.bind(this)

    this.state = {rerender: 0, howToPlatform: isMobileDevice() ? "mobile" : "pc"}
  }

  updateCookie(name, value) {
    const expires = ";SameSite=Strict;path=/;expires=" + new Date().setFullYear(new Date().getFullYear() + 10)
    document.cookie = name + "=" + value + expires
    this.setState({rerender: this.state.rerender + 1})
  }

  render() {
    const showHowTo = (/howto=([^;]*)(?:;|$)/.exec(document.cookie) || {})[1] === "true"
    const showThanks = (/thanks=([^;]*)(?:;|$)/.exec(document.cookie) || {})[1] === "true"

    return <div className="introduction-text resizable-text text-shadow">
      <div style={{textAlign: "center"}}>
        This is a web version of <i>Fate/Stay Night</i>,
        a <a href="https://en.wikipedia.org/wiki/Fate/stay_night">visual novel by Type-Moon</a>.
      </div>
      <div style={{textAlign: "center"}}>
        Our goal is to make it simple to find or share a favorite scene, without having to navigate the full game.
      </div>
      <br/>
      <br/>
      <div className="introduction-dropdown">
        <div onClick={() => this.updateCookie("howto", !showHowTo)}>
          How to Use this Site {showHowTo ? "▼" : "▶"}
        </div>
      </div>
      {showHowTo && <div className="howto-content">
        <br/>
        <i>Quick start: choose a route, open a scene from its flowchart, and read using the on-screen controls or keyboard. Your progress is saved in this browser.</i>
        <br/><br/>
        <div className="howto-device-tabs" role="tablist" aria-label="Device instructions">
          <button type="button" role="tab" aria-selected={this.state.howToPlatform === "pc"} className={this.state.howToPlatform === "pc" ? "active" : ""} onClick={() => this.setState({howToPlatform: "pc"})}>PC / Desktop</button>
          <button type="button" role="tab" aria-selected={this.state.howToPlatform === "mobile"} className={this.state.howToPlatform === "mobile" ? "active" : ""} onClick={() => this.setState({howToPlatform: "mobile"})}>Mobile</button>
        </div>
        {this.state.howToPlatform === "pc" ? <div className="howto-device-panel">
          <b>Using a PC</b><br/>
          • Choose Fate, Unlimited Blade Works, or Heaven's Feel, then select a scene from the route flowchart. The flowchart is also useful for jumping to a specific scene.<br/>
          • Click the reading area or press <kbd>Enter</kbd>, <kbd>Space</kbd>, or <kbd>→</kbd> to advance. Use <kbd>Shift</kbd> + <kbd>Enter</kbd>, <kbd>Shift</kbd> + <kbd>Space</kbd>, or <kbd>←</kbd> to go back.<br/>
          • Press <kbd>Esc</kbd> to open Settings. In Controls, customize Advance, Go back, Auto, Skip, Hide interface, and Backlog shortcuts. <kbd>Ctrl</kbd> is the default Skip shortcut; change it there if it conflicts with your browser or operating system.<br/>
          • The control bar provides Back, Auto, Skip, Log (reading history), Hide, Settings, Progress, and Scenes (the scene list). Use Progress to see visited scenes, route availability, tracked affection/ending flags, and manage save slots.<br/>
        </div> : <div className="howto-device-panel">
          <b>Using a phone or tablet</b><br/>
          • Choose a route and tap a scene in its flowchart. Tap the reading area to advance through the text and use on-screen choices to continue at branch points.<br/>
          • Tap the tick control in the top-left corner to open Settings. The Controls tab lists the available keyboard shortcuts; physical keyboards can use the same bindings.<br/>
          • Use the on-screen control bar for Back, Auto, Skip, Log (reading history), Hide, Settings, Progress, and Scenes (the scene list). On narrow screens, the controls may wrap or become icon-only to keep touch targets separate.<br/>
          • In Reading settings, adjust font family, font size, text-box opacity, and reading mode. Force landscape can provide a wider reading layout where your device/browser supports it.<br/>
        </div>}
        <br/>
        <b>Settings and current scene</b><br/>
        • Open Settings → Progress to see the scene currently being read, the number of indexed scenes visited, route progress, and available save slots. The current scene is shown at the top of that tab.<br/>
        • Open Settings → Controls to change keyboard bindings. Assign different keys to avoid conflicts; Ctrl is available as the Skip shortcut. Browser and operating-system shortcuts may take priority over the website.<br/>
        <br/>
        <b>Saving and progression</b><br/>
        • Your reading position, visited scenes, backlog, and recorded choices are stored in this browser. Use Settings → Progress to save to a slot, load or clear a slot, or export/import a JSON save file.<br/>
        • To continue on another device or browser, export a save file here and import it there. Browser storage can be cleared independently, so keep an exported backup if the progress matters to you.<br/>
        • This reader does not fully reproduce the original game's hidden flags, affection logic, achievements, or every conditional route decision. Route percentages count indexed scenes visited; they are not a measure of original-game route completion. Affection and ending records only show values/flags that the reader currently tracks.<br/>
        <br/>
        <b>About this web version</b><br/>
        This is a web version of <i>Fate/stay night</i>, a visual novel by Type-Moon. It is designed for reading, looking up, and sharing scenes; it is not a replacement for the complete original VN. The page URL updates as you progress, so you can bookmark or share a particular scene.<br/>
        <br/>
        Please leave feedback <a href="https://discord.gg/ejespgUpgg">on Discord</a>. The code is <a href="https://github.com/Kent-H/kirikiri-web">available on GitHub</a>.
        <br/><br/>
      </div>}
      <br/>
      <div className="introduction-dropdown">
        <div onClick={() => this.updateCookie("thanks", !showThanks)}>
          Acknowledgements {showThanks ? "▼" : "▶"}
        </div>
      </div>
      <br/>
      {showThanks && <div>
        This project was inspired by
        Seorin's <a href="https://lparchive.org/Fatestay-night/">F/SN playthroughs</a> over
        on the <a href="https://lparchive.org/">Let's Play Archive</a>.
        I originally went searching for a text-only version of <i>fate/</i> to facilitate searching &
        cross-referencing,
        but Seorin's work demonstrated to me that the whole game could be very comfortably enjoyed in a plain-text
        format.
        All I really thought was missing was a dark theme,
        and some way to have music queued up automatically in the background.
        <br/>
        <br/>
        A special thanks to the Mirror-Moon team, it has been a joy to read through & reverse-engineer the source
        code.
        Bits of each contributor's personality are scattered throughout, and it has been a truly unique experience to
        open up a project that's been meticulously curated by so many passionate people over the years.
        None of this would have been possible without relying on their work.
        <br/>
        <br/>
        And of course, thanks to Type-Moon, and to Mr. Nasu himself, for creating this universe that we all love so
        much.
        A special form of thanks is deserved here, for allowing the existence of these fan projects; not only for this
        one, but for each and every project which paves the way for the next.
        <br/>
        <br/>
        So I shall add my name to the list of people who have said these same words over the years:
        <br/>
        <br/>
        <div style={{textAlign: "center"}}>
          <i>Thanks for playing</i>,
          <br/>
          <br/>
          - Kent Hagerman
        </div>
        <br/>
      </div>}
      <br/>
      <div className="introduction-hr"/>
    </div>
  }
}

export default Introduction
