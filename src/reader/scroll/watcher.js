import React, {Component} from "react"
import {withRouter} from "react-router"
import {withOptions} from "../debug"
import {getResume, markRead, pushLog, saveResume} from "../../progress/progress"
import {clearModes, peekModes} from "../toast/notice"
import "../reader.css"

const {Provider: AnimationProvider, Consumer: AnimationConsumer} = React.createContext({id: 0})
const {Provider: ScrollProvider, Consumer: ScrollConsumer} = React.createContext({id: 0})
// VN mode only: {atEnd} is true once the final page of the final section is on screen (time to show choices)
const {Provider: VnProvider, Consumer: VnConsumer} = React.createContext({atEnd: false, shown: true, loading: false, auto: false, skip: false, uiHidden: false, actions: {}})

// the shortest time between two hand-made advances (clicks, taps, keys); see vnAdvance
const MIN_INPUT_GAP = 280

// true until the first reader of this page load has mounted: only then can "the page was reloaded" mean "pick up here"
let firstReaderOfPageLoad = true

const pageWasReloaded = () => {
  try {
    const nav = window.performance.getEntriesByType("navigation")[0]
    return !!nav && nav.type === "reload"
  } catch (e) {
    return false
  }
}

class ScrollWatcher extends Component {
  lastScrollSection
  lastScrollTime

  constructor(props) {
    super(props)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.scrollTo = this.scrollTo.bind(this)
    this.addAnchor = this.addAnchor.bind(this)
    this.onSectionVisibilityChange = this.onSectionVisibilityChange.bind(this)
    this.onWheel = this.onWheel.bind(this)
    this.onClick = this.onClick.bind(this)
    this.onTouchStart = this.onTouchStart.bind(this)
    this.onTouchEnd = this.onTouchEnd.bind(this)
    this.fitTextBox = this.fitTextBox.bind(this)
    this.onAnimationReady = this.onAnimationReady.bind(this)
    this.vnActions = {
      back: () => this.vnAdvance(-1),
      toggleAuto: () => this.setState(state => ({auto: !state.auto, skip: false})),
      toggleSkip: () => this.setState(state => ({skip: !state.skip, auto: false})),
      toggleHide: () => this.setState(state => ({uiHidden: !state.uiHidden})),
      openLog: () => this.props.options.openLog && this.props.options.openLog(),
    }

    // VN mode state (see the "VN mode" section below)
    this.sections = {}      // numeric section id -> {ref, savePoints, timeline, bgmTimeline, seTimeline}
    this.saveOwners = {}    // save point name -> id of the section that owns it
    this.pageTop = 0        // scrollTop (target) of the text box within the current section
    this.vnStarted = false
    this.lastWheelEvent = 0
    this.lastInput = 0      // time of the last hand-made advance (see MIN_INPUT_GAP)
    this.animReady = false  // have the picture / sound for the current section loaded and started?

    this.savePointAtLoadTime = props.location.hash
    this.linkRefs = {}
    // pick up at the saved page when arriving from "Resume" on the scene list, or when this page was just reloaded
    this.restore = !!(props.location.state && props.location.state.resume) || (firstReaderOfPageLoad && pageWasReloaded())
    this.navigating = false

    this.lastJumpTime = new Date()
    // to avoid unnecessary re-rendering, we will recreate the value for the provider only when the scrolled section changes
    this.includeCallbacks = {
      onSectionChange: this.onSectionVisibilityChange,
      addAnchor: this.addAnchor,
      onAnimationReady: this.onAnimationReady,
    }
    this.visible = {}
    const visible = Object.assign({id: 0}, this.includeCallbacks)
    // Auto / Skip carry over when the previous scene handed over to this one by itself
    const modes = peekModes()
    this.state = {visible: visible, nextVisible: visible, atEnd: false, shown: false, loading: false, auto: modes.auto, skip: modes.skip, uiHidden: false}
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.visible.id !== this.state.visible.id) {
      const section = this.linkRefs[this.state.visible.id]
      const hash = section && section.savePoints.length !== 0 ? ("#" + section.savePoints[0]) : ""
      this.props.history.replace({
        pathname: this.props.location.pathname,
        search: this.props.location.search,
        hash,
        state: this.props.location.state, // keeps "resume" through a reload
      })
    }
    if (this.isVn() && prevProps.ready !== this.props.ready) {
      this.updateEnd()
    }
    if (this.isVn()) {
      const s = this.state
      if (prevState.shown !== s.shown) {
        this.positionMarker()
        if (s.shown) {
          this.recordPage()
        }
      }
      if (prevState.auto !== s.auto || prevState.shown !== s.shown || prevState.visible.id !== s.visible.id ||
        prevProps.isOnTop !== this.props.isOnTop || prevState.atEnd !== s.atEnd) {
        this.scheduleAuto()
      }
      if (s.atEnd && (s.auto || s.skip) && !this.props.hasNext) {
        this.setState({auto: false, skip: false}) // nothing left to advance through, and the player has to choose
        return
      }
      if (prevState.skip !== s.skip) {
        this.startSkip()
      }
    }
  }

  startSkip() {
    clearInterval(this.skipTimer)
    if (this.state.skip) {
      this.skipTimer = setInterval(() => {
        if (this.props.isOnTop) {
          this.vnAdvance(1, true)
        }
      }, 150)
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.onKeyDown)
    firstReaderOfPageLoad = false
    clearModes()
    if (this.props.sceneID) {
      markRead(this.props.sceneID)
    }
    if (this.state.skip) {
      this.startSkip()
    }
    if (this.isVn()) {
      document.body.classList.add("vn-mode")
      document.addEventListener("wheel", this.onWheel, {passive: true})
      document.addEventListener("click", this.onClick)
      document.addEventListener("touchstart", this.onTouchStart, {passive: true})
      document.addEventListener("touchend", this.onTouchEnd, {passive: true})
      window.addEventListener("resize", this.fitTextBox)
      window.addEventListener("orientationchange", this.fitTextBox)
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => this.mounted && this.fitTextBox()) // line breaks move once the font arrives
      }
      this.fitTextBox()
    }
    this.mounted = true
  }

  componentWillUnmount() {
    this.mounted = false
    document.removeEventListener("keydown", this.onKeyDown)
    clearTimeout(this.startTimer)
    clearTimeout(this.time)
    clearTimeout(this.revealTimer)
    clearTimeout(this.autoTimer)
    clearInterval(this.skipTimer)
    if (this.isVn()) {
      document.body.classList.remove("vn-mode")
      document.removeEventListener("wheel", this.onWheel)
      document.removeEventListener("click", this.onClick)
      document.removeEventListener("touchstart", this.onTouchStart)
      document.removeEventListener("touchend", this.onTouchEnd)
      window.removeEventListener("resize", this.fitTextBox)
      window.removeEventListener("orientationchange", this.fitTextBox)
    }
  }

  onKeyDown(e) {
    if (!this.props.isOnTop) {
      return
    }

    if (this.isVn()) {
      const bindings = this.props.options
      const action = e.code === bindings.keySkip && bindings.keySkip === "ControlLeft" ? "toggleSkip" :
        (!e.ctrlKey && !e.metaKey && !e.altKey ? (e.code === bindings.keyAuto ? "toggleAuto" :
        e.code === bindings.keySkip ? "toggleSkip" :
        e.code === bindings.keyHide ? "toggleHide" :
        e.code === bindings.keyBacklog ? "openLog" : null) : null)
      if (action) {
        e.preventDefault()
        this.vnActions[action]()
        return
      }
    }

    // forward: space w/o shift, enter w/o shift, down arrow, right arrow
    // backward: space w/ shift, enter w/ shift, up arrow, left arrow
    const options = this.props.options || {}
    const moveDirection = (e.code === options.keyNext || (((e.keyCode === 32 || e.keyCode === 13) && !e.shiftKey) || e.keyCode === 40 || e.keyCode === 39)) ? 1 :
      (e.code === options.keyPrevious || (((e.keyCode === 32 || e.keyCode === 13) && e.shiftKey) || e.keyCode === 38 || e.keyCode === 37)) ? -1 : 0

    if (moveDirection !== 0) {
      e.preventDefault()
      if (this.isVn()) {
        this.vnAdvance(moveDirection)
        return
      }
      if (this.state.visible) {
        const movedRecently = this.lastScrollTime && new Date() - this.lastScrollTime < 500
        let currentSection = movedRecently ? this.lastScrollSection : this.state.visible.id
        let moveToSection = moveDirection + currentSection
        let partialAdvance = false
        if (!movedRecently || !this.linkRefs[moveToSection]) {
          if (moveDirection > 0) { // if moving forwards, check to see if the current sections's text trails off the end of the screen, or if there is no next section
            const section = this.linkRefs[currentSection]
            const nextSection = this.linkRefs[moveToSection]
            partialAdvance = !nextSection || (section && section.ref.current && section.ref.current.node.getBoundingClientRect().bottom > window.innerHeight * 4 / 5)
          } else { // if moving backwards, check that the top is in sight
            const section = this.linkRefs[currentSection]
            moveToSection += section && section.ref.current && section.ref.current.node.getBoundingClientRect().top < window.innerHeight * -0.4 ? 1 : 0
          }
        }
        this.scrollTo(moveToSection, partialAdvance, true)
      }
    }
  }

  scrollTo(moveToSection, partialAdvance, smooth) {
    if (partialAdvance) {
      this.lastScrollTime = new Date()
      this.lastScrollSection = moveToSection - 1
      window.scrollBy({top: window.innerHeight * 0.4, behavior: smooth ? "smooth" : "auto"})
      return
    }

    const section = this.linkRefs[moveToSection]
    if (section && section.ref.current) {
      this.lastScrollTime = new Date()
      this.lastScrollSection = moveToSection
      const rect = section.ref.current.node.getBoundingClientRect()
      window.scrollTo({
        top: window.pageYOffset + rect.top - (moveToSection !== 1 ? window.innerHeight * -0.07 : window.innerHeight * -0.07),
        behavior: smooth ? "smooth" : "auto",
      })
      // attempt to proactively update the visible section (to reduce latency of the text opacity transition)
      // this could theoretically de-sync the scrolled section in certain situations
      this.setState({nextVisible: Object.assign({}, this.includeCallbacks, {id: moveToSection})})
    }
    this.hasScrolled = true
  }

  addAnchor(id, ref, savePoints, isSaveOwner, data) {
    const section = {id, ref, savePoints}
    this.linkRefs[id] = section
    savePoints.forEach(savePoint => {
      this.linkRefs[savePoint] = section
    })

    if (this.isVn()) {
      this.sections[id] = Object.assign({id, ref, savePoints}, data)
      if (isSaveOwner) {
        savePoints.forEach(savePoint => {
          this.saveOwners["#" + savePoint] = id
        })
      }
      // all sections of a script mount in the same commit; wait until they have all registered before picking a start
      clearTimeout(this.startTimer)
      this.startTimer = setTimeout(() => this.vnStart(), 0)
      return
    }

    if (!this.hasScrolled && isSaveOwner) {
      if (savePoints.some(savePoint => ("#" + savePoint === this.savePointAtLoadTime))) {
        this.scrollTo(id, false, false)
      }
    }
  }

  onSectionVisibilityChange(id, visible, timeline, bgmTimeline, seTimeline) {
    if (!!this.visible[id] === visible) {
      return // exit early if there is no change
    }

    if (visible) {
      this.visible[id] = {id, timeline, bgmTimeline, seTimeline}
    } else {
      delete this.visible[id]
    }
    // try to only run setState once
    clearTimeout(this.time)
    this.time = setTimeout(() => {
      const visible = Object.assign({}, this.includeCallbacks, Object.keys(this.visible).reduce((a, b) => (a.id > this.visible[b].id ? a : this.visible[b]), {id: 0}))
      // nextVisible is used to update scroll watchers (not all scroll watchers are enabled at once,
      // so even if all scroll watchers have updated,
      // there may be disabled scroll watchers which need to update before we perform the (expensive) asset load
      this.setState({nextVisible: visible})

      if (new Date() - this.lastJumpTime < 200) { // if we've jumped recently
        this.time = setTimeout(() => this.setState({visible}), 200) // wait a moment to see if another jump happens
      } else {
        this.setState({visible})
      }
      this.lastJumpTime = new Date()
    }, 1)
  }

  // ---------------------------------------------------------------------------------------------------------------
  // VN mode
  //
  // Instead of working out which section is on screen from the scroll position, the current section is stepped
  // through explicitly (click / space / enter / arrows / wheel).  Every section is rendered but only the focused one
  // is displayed, inside a fixed-height text box.  Sections too long for the box are split into pages.
  // The animation / audio pipeline is unchanged: it simply receives the current section as `visible`.
  // ---------------------------------------------------------------------------------------------------------------

  isVn() {
    return this.props.options.readMode !== "scroll"
  }

  isNvl() {
    return this.props.options.readMode === "nvl"
  }

  sectionIDs() {
    return Object.keys(this.sections).map(id => parseInt(id, 10)).sort((a, b) => a - b)
  }

  hasText(id) {
    const section = this.sections[id]
    const node = section && section.ref.current
    return !!node && node.textContent.trim() !== ""
  }

  // the last section with something to read; trailing sections with no text never need a click of their own
  lastReadable() {
    const ids = this.sectionIDs().filter(id => this.hasText(id))
    return ids.length !== 0 ? ids[ids.length - 1] : 0
  }

  vnStart() {
    if (this.vnStarted || !this.isVn()) {
      return
    }
    const ids = this.sectionIDs()
    if (ids.length === 0) {
      return
    }
    this.vnStarted = true
    const saved = this.saveOwners[this.savePointAtLoadTime]
    const first = ids.find(id => this.hasText(id)) || ids[0]

    // coming back to a scene that was left half-read: go to the section and page it was left on
    const resume = this.restore && this.props.sceneID ? getResume() : null
    const mine = resume && resume.id === this.props.sceneID ? resume : null
    let target = saved
    if (mine && !target && this.sections[mine.sec]) {
      target = mine.sec
    }
    const page = mine && target === mine.sec ? mine.page || 0 : 0
    this.vnGoTo(target || first, false, page)
  }

  // remember where the reader is, so the scene list can offer to come back here
  saveProgress() {
    const sceneID = this.props.sceneID
    const id = this.state.visible.id
    const box = this.props.boxRef && this.props.boxRef.current
    if (!sceneID || id === 0 || !box || !this.mounted) {
      return
    }
    const section = this.linkRefs[id]
    const step = Math.max(box.clientHeight, 1)
    saveResume({
      id: sceneID,
      hash: section && section.savePoints.length !== 0 ? "#" + section.savePoints[0] : "",
      sec: id,
      page: Math.round(Math.min(this.pageTop, this.maxPageTop(box)) / step),
    })
  }

  // the text on the page now showing, for the backlog.  Lines are told apart by where they sit, so a paragraph
  // that runs over the page break only contributes the lines on this side of it.
  pageText() {
    const box = this.props.boxRef && this.props.boxRef.current
    const section = this.sections[this.state.visible.id]
    const node = section && section.ref.current
    if (!box || !node) {
      return ""
    }
    const view = box.getBoundingClientRect()
    const top = view.top - 2
    const bottom = view.bottom + 2
    const inside = r => r.top >= top && r.bottom <= bottom

    const walker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode: n => n.nodeType === 1 ? (n.tagName === "RT" ? NodeFilter.FILTER_REJECT : (n.tagName === "BR" ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP)) : NodeFilter.FILTER_ACCEPT,
    })
    const range = document.createRange()
    let out = ""
    while (walker.nextNode()) {
      const n = walker.currentNode
      if (n.nodeType === 1) { // a line break
        const rects = n.getClientRects()
        if (out !== "" && (rects.length === 0 || rects[0].top <= bottom)) {
          out += "\n"
        }
        continue
      }
      const text = n.nodeValue
      if (text.trim() === "") {
        continue
      }
      range.selectNodeContents(n)
      const rects = Array.prototype.filter.call(range.getClientRects(), r => r.width > 0 || r.height > 0)
      if (rects.length === 0) {
        continue
      }
      const visible = rects.filter(inside).length
      if (visible === rects.length) {
        out += text
      } else if (visible !== 0) { // runs over the page break: keep just the characters on this page
        let prev = false
        for (let i = 0; i < text.length; i++) {
          range.setStart(n, i)
          range.setEnd(n, i + 1)
          const r = range.getBoundingClientRect()
          const keep = r.height > 0 ? inside(r) : prev
          if (keep) {
            out += text[i]
          }
          prev = keep
        }
      }
    }
    return out.replace(/\u00a0/g, " ").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim()
  }

  recordPage() {
    if (this.props.sceneID && this.isVn()) {
      pushLog(this.props.sceneID, this.state.visible.id, this.pageText())
    }
  }

  // a page has been turned: update the resume point and, going forward, the backlog
  afterPageTurn(forward) {
    this.saveProgress()
    if (forward) {
      this.recordPage()
    }
  }

  vnGoTo(id, fromEnd, page) {
    const section = this.sections[id]
    if (!section) {
      return
    }
    this.pageTop = fromEnd ? Infinity : 0
    const visible = Object.assign({}, this.includeCallbacks, {
      id,
      timeline: section.timeline,
      bgmTimeline: section.bgmTimeline,
      seTimeline: section.seTimeline,
    })
    this.hasScrolled = true
    // hold the text back until the picture for this section has loaded (see onAnimationReady)
    this.animReady = false
    clearTimeout(this.revealTimer)
    this.revealTimer = setTimeout(() => this.reveal(id), 4000) // fallback in case an asset never reports in
    this.setState({visible, nextVisible: visible, shown: false, loading: true}, () => {
      this.fitTextBox()
      const box = this.props.boxRef && this.props.boxRef.current
      if (page && box) {
        this.pageTop = page * Math.max(box.clientHeight, 1) // (clamped to the last page by applyPageTop)
      }
      this.applyPageTop(false)
      this.saveProgress()
    })
  }

  // Auto: wait long enough to read what is on screen (and let voices play), then turn the page
  scheduleAuto() {
    clearTimeout(this.autoTimer)
    const {auto, shown, atEnd, visible} = this.state
    // at the end of a scene Auto keeps going if the story carries straight on into the next one
    if (!this.mounted || !auto || !shown || (atEnd && !this.props.hasNext) || !this.props.isOnTop || visible.id === 0) {
      return
    }
    // Base the wait on the page currently on screen rather than the whole source section.
    // The previous whole-section estimate routinely hit its 12s cap on long scenes.
    const currentText = this.pageText()
    const speed = {slow: 1.6, normal: 1, fast: 0.55}[this.props.options.autoSpeed] || 1
    const delay = Math.min(7000, Math.max(900, (700 + 32 * currentText.length) * speed))
    this.autoTimer = setTimeout(() => {
      // A menu or backlog may have opened after this timer was queued.
      if (!this.mounted || !this.state.auto || !this.props.isOnTop || this.state.loading) return
      this.vnAdvance(1, true)
      // Page turns within one section do not change React state, so queue the next page explicitly.
      this.scheduleAuto()
    }, delay)
  }

  // called by <Animation/> once the images / sounds for section `id` have loaded and it has started playing
  onAnimationReady(id) {
    if (!this.isVn() || id !== this.state.visible.id) {
      return
    }
    this.animReady = true
    this.setState({loading: false})
    // let short fade-ins finish before the text appears (capped, so long cutscene waits don't hide the text)
    const section = this.sections[id]
    let end = 0
    Object.keys((section && section.timeline) || {}).forEach(layer => {
      section.timeline[layer].forEach(frame => {
        end = Math.max(end, frame.time || 0)
      })
    })
    clearTimeout(this.revealTimer)
    this.revealTimer = setTimeout(() => this.reveal(id), Math.min(end, 1500))
  }

  reveal(id) {
    clearTimeout(this.revealTimer)
    if (id === this.state.visible.id && !this.state.shown) {
      this.animReady = true // (also the fallback path: stop waiting for assets that never reported in)
      this.setState({shown: true, loading: false})
    }
  }

  // keeps the text box an exact number of lines tall, so a page never ends in half a line of the next one
  fitTextBox() {
    const box = this.props.boxRef && this.props.boxRef.current
    if (!box || !box.firstElementChild) {
      return
    }
    box.style.flex = ""
    box.style.height = ""
    const lineHeight = parseFloat(window.getComputedStyle(box.firstElementChild).lineHeight)
    const available = box.clientHeight // measure before changing flex, which would collapse the box to its content
    // NVL: the layer is only as tall as its text (up to a cap set in css), so short passages don't get a tall empty box
    const fits = this.isNvl() && box.scrollHeight <= available + 1
    if (!fits && lineHeight > 0 && available > lineHeight) {
      box.style.flex = "none"
      box.style.height = Math.floor(available / lineHeight) * lineHeight + "px"
    }
    this.applyPageTop(false)
  }

  maxPageTop(box) {
    return Math.max(0, box.scrollHeight - box.clientHeight)
  }

  applyPageTop(smooth) {
    const box = this.props.boxRef && this.props.boxRef.current
    if (box) {
      this.pageTop = Math.min(this.pageTop, this.maxPageTop(box))
      box.style.scrollBehavior = smooth ? "smooth" : "auto"
      box.scrollTop = this.pageTop
    }
    this.updateEnd()
    this.positionMarker()
  }

  // NVL: park the "more to read" chevron right after the last character visible on the current page
  positionMarker() {
    const marker = this.props.nextRef && this.props.nextRef.current
    const box = this.props.boxRef && this.props.boxRef.current
    const section = this.sections[this.state.visible.id]
    const node = section && section.ref.current
    if (!this.isNvl() || !marker || !box || !node || !marker.parentElement) {
      return
    }
    const view = box.getBoundingClientRect()
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT)
    const range = document.createRange()
    let last = null
    while (walker.nextNode()) {
      if (walker.currentNode.nodeValue.trim() === "") {
        continue
      }
      range.selectNodeContents(walker.currentNode)
      const rects = range.getClientRects()
      for (let i = 0; i < rects.length; i++) {
        const r = rects[i]
        if (r.width > 0 && r.top >= view.top - 2 && r.bottom <= view.bottom + 2) {
          last = r
        }
      }
    }
    if (!last) {
      return
    }
    const parent = marker.parentElement.getBoundingClientRect()
    const size = marker.offsetHeight || last.height
    marker.style.left = (last.right - parent.left + last.height * 0.25) + "px"
    marker.style.top = (last.top - parent.top + (last.height - size) / 2) + "px"
    marker.style.right = "auto"
    marker.style.bottom = "auto"
  }

  // are we on the last page of the last section (and has the whole script finished loading)?
  updateEnd() {
    const box = this.props.boxRef && this.props.boxRef.current
    const id = this.state.visible.id
    const atEnd = !!this.props.ready && id !== 0 && id >= this.lastReadable() &&
      (!box || this.pageTop >= this.maxPageTop(box) - 2)
    if (atEnd !== this.state.atEnd) {
      this.setState(atEnd && !this.props.hasNext ? {atEnd, auto: false, skip: false} : {atEnd})
    }
  }

  // `automatic` is true for advances made by Auto / Skip themselves; anything the reader does by hand cancels those
  vnAdvance(direction, automatic) {
    const id = this.state.visible.id
    if (id === 0 || !this.mounted || this.navigating) {
      return
    }

    if (!automatic) {
      // Two inputs in quick succession (double-tap, key repeat, a click that lands as the page turns) must not read as
      // a skip, or the text runs ahead of the picture and sound.
      const now = Date.now()
      if (now - this.lastInput < MIN_INPUT_GAP) {
        return
      }
      // This scene's picture / sound are still loading: wait for them instead of racing ahead (the text is shown
      // as soon as they have started, or after a few seconds if something never arrives).
      if (!this.state.shown && !this.animReady) {
        return
      }
      this.lastInput = now

      if (this.state.uiHidden) {
        this.setState({uiHidden: false}) // the first input just brings the text box back
        return
      }
      if (this.state.auto || this.state.skip) {
        this.setState({auto: false, skip: false})
      }
    }

    // a click while the picture is still fading in just shows the text straight away (it never advances as well)
    if (!this.state.shown) {
      this.reveal(id)
      return
    }

    // first try turning a page within the current section
    const box = this.props.boxRef && this.props.boxRef.current
    if (box) {
      const max = this.maxPageTop(box)
      const step = Math.max(box.clientHeight, 1)
      if (direction > 0 && this.pageTop < max - 2) {
        this.pageTop = Math.min(this.pageTop + step, max)
        this.applyPageTop(false)
        this.afterPageTurn(true)
        return
      }
      if (direction < 0 && this.pageTop > 0) {
        this.pageTop = Math.max(this.pageTop - step, 0)
        this.applyPageTop(false)
        this.afterPageTurn(false)
        return
      }
    }

    // then move to the neighbouring section, skipping any which have nothing to read
    let next = id + direction
    while (this.sections[next] && !this.hasText(next)) {
      next += direction
    }
    if (this.sections[next]) {
      this.vnGoTo(next, direction < 0)
      return
    }

    // the end of the scene, and the story goes straight on: hand over to the next scene (the reader announces it)
    if (direction > 0 && this.state.atEnd && this.props.hasNext && this.props.onEnd) {
      const result = this.props.onEnd(automatic ? {auto: this.state.auto, skip: this.state.skip} : {})
      if (result === "stop") { // Skip does not run on into scenes that haven't been read yet
        this.setState({skip: false})
      } else if (result) {
        this.navigating = true
      }
    }
  }

  onWheel(e) {
    if (!this.props.isOnTop || Math.abs(e.deltaY) < 2) {
      return
    }
    // trackpads fire a long tail of events for one swipe, so only the first event of a burst counts
    const now = Date.now()
    const gap = now - this.lastWheelEvent
    this.lastWheelEvent = now
    if (gap > 150) {
      this.vnAdvance(e.deltaY > 0 ? 1 : -1)
    }
  }

  // touch screens: swipe left for the next page, right to go back
  onTouchStart(e) {
    const t = e.touches.length === 1 ? e.touches[0] : null
    this.touch = t && {x: t.clientX, y: t.clientY, time: Date.now(), target: e.target}
  }

  onTouchEnd(e) {
    const start = this.touch
    this.touch = null
    const t = e.changedTouches[0]
    if (!start || !t || !this.props.isOnTop || Date.now() - start.time > 600) {
      return
    }
    if (start.target.closest && start.target.closest("a, button, input, label, .menu, .backlog, .click-to-start, .tick, .vn-choices, .rotate-prompt")) {
      return
    }
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) {
      this.vnAdvance(dx < 0 ? 1 : -1)
    }
  }

  onClick(e) {
    if (!this.props.isOnTop || e.button !== 0) {
      return
    }
    if (e.target.closest && e.target.closest("a, button, input, label, .menu, .menu-background, .backlog, .click-to-start, .tick, .vn-choices, .rotate-prompt")) {
      return
    }
    this.vnAdvance(1)
  }

  vnValue() {
    // keep the context value stable so consumers only re-render when something they show has changed
    const {atEnd, shown, loading, auto, skip, uiHidden} = this.state
    const c = this.vnCache
    if (!c || c.atEnd !== atEnd || c.shown !== shown || c.loading !== loading || c.auto !== auto || c.skip !== skip || c.uiHidden !== uiHidden) {
      this.vnCache = {atEnd, shown, loading, auto, skip, uiHidden, actions: this.vnActions}
    }
    return this.vnCache
  }

  render() {
    return <ScrollProvider value={this.state.nextVisible}>
      <AnimationProvider value={this.state.visible}>
        <VnProvider value={this.vnValue()}>
        {this.props.options.debugLevel !== 0 && <div style={{position: "fixed", backgroundColor: "darkred"}}>
          {this.state.visible.id}<br/>{this.state.nextVisible.id}
        </div>}

        {this.props.children}
        </VnProvider>
      </AnimationProvider>
    </ScrollProvider>
  }
}

const withScrollDetect = Component => (
  props => (
    <ScrollConsumer>
      {value => <Component {...props} scroll={value}/>}
    </ScrollConsumer>
  )
)

const withVn = Component => (
  props => (
    <VnConsumer>
      {value => <Component {...props} vn={value}/>}
    </VnConsumer>
  )
)

const withScroll = Component => (
  props => (
    <AnimationConsumer>
      {value => <Component {...props} animation={value}/>}
    </AnimationConsumer>
  )
)

ScrollWatcher = withOptions(withRouter(ScrollWatcher))
export {ScrollWatcher, withScrollDetect, withScroll, withVn}
