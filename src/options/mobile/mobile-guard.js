import React, {useEffect, useMemo, useRef, useState} from "react"
import {withOptions} from "../../reader/debug"
import {isFullscreen, isMobileDevice, isPortrait, lockLandscape, tryLockLandscape, unlockOrientation} from "./mobile"
import "./mobile.css"

// On phones (everywhere in the app, not just while reading): lock to landscape where the browser allows it
// (installed web app, or fullscreen on Android Chrome after the first tap), and where it doesn't (iPhone Safari,
// plain browser tabs) cover a portrait screen with a "rotate your device" prompt.
const MobileGuard = ({options}) => {
  const mobile = useMemo(isMobileDevice, [])
  const [portrait, setPortrait] = useState(isPortrait())
  const tried = useRef(false)

  const active = mobile && options.landscape

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
      if (mobile) {
        unlockOrientation()
      }
      return undefined
    }
    // installed web apps (and some browsers) allow the lock without a gesture, so try straight away
    tryLockLandscape()
    // otherwise browsers only allow fullscreen / orientation lock from inside a tap, so use the first one
    const onTap = () => {
      if (!tried.current && !isFullscreen()) {
        tried.current = true
        lockLandscape()
      }
    }
    document.addEventListener("pointerup", onTap)
    return () => document.removeEventListener("pointerup", onTap)
  }, [active, mobile])

  if (!active || !portrait) {
    return null
  }

  return <div className="rotate-prompt" role="alertdialog" aria-label="Rotate your device">
    <svg className="rotate-prompt-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect className="rotate-prompt-phone" x="22" y="8" width="20" height="36" rx="3"/>
      <path d="M12 50c6 6 14 8 22 6M34 56l-5-1M34 56l1-5"/>
    </svg>
    <div className="rotate-prompt-title">Rotate your device</div>
    <div className="rotate-prompt-text">This story is best viewed in landscape.</div>
    <button type="button" className="rotate-prompt-skip" onClick={() => options.setLandscape && options.setLandscape(false)}>
      Turn off landscape lock
    </button>
  </div>
}

export default withOptions(MobileGuard)
