// Helpers for phones / small tablets: a viewport-height variable that ignores the browser toolbars,
// and a best-effort "fullscreen + landscape lock".

export const HOME_PATH = /^\/(prologue|プロローグ|fate|saber|セイバ|ubw|rin|凛|hf|sakura|桜)?\/?$/

const matches = query => !!(window.matchMedia && window.matchMedia(query).matches)

// a touch screen small enough to be a phone / small tablet (either orientation)
export const isMobileDevice = () =>
  matches("(pointer: coarse)") && Math.min(window.screen.width, window.screen.height) <= 900

export const isPortrait = () => matches("(orientation: portrait)")

export const isFullscreen = () => !!(document.fullscreenElement || document.webkitFullscreenElement)

// --vh is 1% of the *visible* height (100vh on phones includes the area behind the address bar)
const setVh = () => {
  document.documentElement.style.setProperty("--vh", window.innerHeight * 0.01 + "px")
}

export const initViewport = () => {
  setVh()
  document.documentElement.setAttribute("data-mobile", isMobileDevice() ? "" : "false")
  if (!isMobileDevice()) {
    document.documentElement.removeAttribute("data-mobile")
  }
  window.addEventListener("resize", setVh)
  window.addEventListener("orientationchange", () => {
    setVh()
    setTimeout(setVh, 250) // iOS reports the new height a moment late
  })
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", setVh)
  }
}

// must be called from a tap / click.  Android Chrome only allows the lock while fullscreen;
// iOS Safari allows neither on iPhone (the rotate prompt covers that case).
export const lockLandscape = async () => {
  const el = document.documentElement
  try {
    const request = el.requestFullscreen || el.webkitRequestFullscreen
    if (request && !isFullscreen()) {
      await request.call(el, {navigationUI: "hide"})
    }
  } catch (e) {
    // refused: carry on, the lock below may still work (installed web apps)
  }
  try {
    if (window.screen.orientation && window.screen.orientation.lock) {
      await window.screen.orientation.lock("landscape")
    }
  } catch (e) {
    // unsupported
  }
}

// no-gesture attempt: succeeds in installed web apps / already-fullscreen pages, silently fails elsewhere
export const tryLockLandscape = () => {
  try {
    if (window.screen.orientation && window.screen.orientation.lock) {
      const result = window.screen.orientation.lock("landscape")
      if (result && result.catch) {
        result.catch(() => {})
      }
    }
  } catch (e) {
    // unsupported
  }
}

export const unlockOrientation = () => {
  try {
    if (window.screen.orientation && window.screen.orientation.unlock) {
      window.screen.orientation.unlock()
    }
  } catch (e) {
    // unsupported
  }
}
