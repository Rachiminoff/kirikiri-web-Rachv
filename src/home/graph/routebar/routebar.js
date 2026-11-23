import React, {useEffect, useRef, useState} from "react"
import {daysForRoute} from "../route"
import "./routebar.css"

const ROUTES = [
  {id: "fate", label: "Fate", sub: "Saber"},
  {id: "ubw", label: "Unlimited Blade Works", short: "UBW", sub: "Rin"},
  {id: "hf", label: "Heaven's Feel", short: "HF", sub: "Sakura"},
]

const chipLabel = (id, lang) => {
  const match = /^(.)(\d*)/.exec(id)
  if (match[1] === "プ") {
    return lang === "jp" ? "プロローグ" : "Prologue"
  }
  return lang === "jp" ? match[2] + "日目" : "Day " + match[2]
}

const jumpTo = id => {
  const el = document.getElementById("day-" + id)
  if (el) {
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
    el.scrollIntoView({behavior: reduce ? "auto" : "smooth", block: "start"})
  }
}

// The sticky bar at the top of the scene list: the route you are on (tap it to change), a row of "jump to day" chips
// for that route, and a key to the lines.
const RouteBar = ({pane, lang, showH, onSelect}) => {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const route = ROUTES[pane] || ROUTES[0]
  const days = daysForRoute(pane)

  // the list closes when you tap anywhere else
  useEffect(() => {
    if (!open) {
      return undefined
    }
    const onOutside = e => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onOutside)
    document.addEventListener("touchstart", onOutside)
    return () => {
      document.removeEventListener("mousedown", onOutside)
      document.removeEventListener("touchstart", onOutside)
    }
  }, [open])

  // ↑ / ↓ walk the open list
  const onListKeyDown = e => {
    const dir = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0
    if (dir !== 0) {
      e.preventDefault()
      const options = Array.prototype.slice.call(e.currentTarget.querySelectorAll(".route-option"))
      const at = options.indexOf(document.activeElement)
      const next = options[(at + dir + options.length) % options.length]
      if (next) {
        next.focus()
      }
    }
  }

  const choose = i => {
    setOpen(false)
    onSelect(i)
  }

  return <div className="routebar" data-route={route.id}>
    <div className="routebar-row">
      <div className="route-select" ref={rootRef}>
        <button type="button"
                className="route-current"
                aria-haspopup="listbox"
                aria-expanded={open}
                title="Change route"
                onClick={() => setOpen(o => !o)}>
          <span className="route-current-name">
            <span className="route-name-full">{route.label}</span>
            <span className="route-name-short">{route.short || route.label}</span>
          </span>
          <small>{route.sub}</small>
          <svg className="route-chevron" viewBox="0 0 10 6" width="0.7em" height="0.45em" aria-hidden="true">
            <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {open &&
        <ul className="route-list" role="listbox" aria-label="Routes" onKeyDown={onListKeyDown}>
          {ROUTES.map((r, i) => (
            <li key={r.id} role="presentation">
              <button type="button"
                      role="option"
                      className="route-option"
                      data-route={r.id}
                      aria-selected={i === pane}
                      autoFocus={i === pane}
                      onClick={() => choose(i)}>
                <span>{r.label}</span>
                <small>{r.sub}</small>
              </button>
            </li>
          ))}
        </ul>}
      </div>

      <div className="routebar-days" aria-label="Jump to day">
        {days.map(day => (
          <button key={day.section} type="button" className="day-chip" onClick={() => jumpTo(day.section)}>
            {chipLabel(day.section, lang)}
          </button>
        ))}
      </div>
    </div>

    <div className="routebar-key" aria-hidden="true">
      <span className="key-item key-scene">Scene</span>
      {showH && <span className="key-item key-h">H scene</span>}
      <span className="key-item key-next">leads to</span>
      <span className="key-item key-prev">comes from</span>
      <span className="key-item key-read">read</span>
      <span className="key-hint">point at a scene to trace its paths</span>
    </div>
  </div>
}

export default RouteBar
