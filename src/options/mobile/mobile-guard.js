import React, {useEffect, useMemo, useRef, useState} from "react"
import {withRouter} from "react-router-dom"
import {withOptions} from "../../reader/debug"
import {HOME_PATH, isFullscreen, isMobileDevice, isPortrait, lockLandscape, unlockOrientation} from "./mobile"
import "./mobile.css"

// On phones, while reading: ask for fullscreen + landscape on the first tap, and where the browser won't allow it
// (iPhone Safari) cover a portrait screen with a "rotate your device" prompt.
const MobileGuard = ({options, location}) => {
  const mobile = useMemo(isMobileDevice, [])
  const [portrait, setPortrait] = useState(isPortrait())
  const [dismissed, setDismissed] = useState(false)
  const tried = useRef(false)

  const reading = !HOME_PATH.test(location.pathname)
  const active = mobile && options.landscape && reading

  useEffect(() => {
    if (!window.matchMedia) {
      return undefined
    }
    const query = window.matchMedia("(orientation: portrait)")
    const update = () => setPortrait(query.matches)
    update()
    query.addListener ? query.addListener(update) : query.addEventListener("change", update)
    return () => query.removeListener ? query.removeListener(update) : query.removeEventListener("change", update)
  }, [])

  useEffect(() => {
    if (!active) {
      tried.current = false
      if (mobile && reading) {
        unlockOrientation()
      }
      return undefined
    }
    // browsers only allow fullscreen / orientation lock from inside a tap, so wait for the first one
    const onTap = () => {
      if (!tried.current && !isFullscreen()) {
        tried.current = true
        lockLandscape()
      }
    }
    document.addEventListener("pointerup", onTap)
    return () => document.removeEventListener("pointerup", onTap)
  }, [active, mobile, reading])

  useEffect(() => {
    // the scene list is happier in portrait, so let go of the lock there
    if (mobile && !reading) {
      unlockOrientation()
    }
  }, [mobile, reading])

  if (!active || !portrait || dismissed) {
    return null
  }

  return <div className="rotate-prompt" role="alertdialog" aria-label="Rotate your device">
    <svg className="rotate-prompt-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect className="rotate-prompt-phone" x="22" y="8" width="20" height="36" rx="3"/>
      <path d="M12 50c6 6 14 8 22 6M34 56l-5-1M34 56l1-5"/>
    </svg>
    <div className="rotate-prompt-title">Rotate your device</div>
    <div className="rotate-prompt-text">This story reads best in landscape.</div>
    <button type="button" className="rotate-prompt-skip" onClick={() => setDismissed(true)}>
      Continue in portrait
    </button>
  </div>
}

export default withRouter(withOptions(MobileGuard))
