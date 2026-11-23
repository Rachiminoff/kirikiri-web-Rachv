import React, {useEffect, useReducer, useRef} from "react"
import {clearLog, getLog, subscribeLog} from "../../progress/progress"
import {SceneTitle} from "../../resources/titles"
import "./backlog.css"

// The log of every page read so far (it is kept between visits), newest at the bottom, like a console VN's backlog.
const Backlog = ({visible, lang, onClose}) => {
  const [, refresh] = useReducer(n => n + 1, 0)
  const listRef = useRef(null)
  const closeRef = useRef(null)

  useEffect(() => subscribeLog(refresh), [])

  // always open on the most recent page
  useEffect(() => {
    if (visible && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
    if (visible && closeRef.current) {
      closeRef.current.focus()
    }
  }, [visible])

  if (!visible) {
    return null
  }

  const entries = getLog()
  let lastScene
  const rows = entries.map((entry, i) => {
    const heading = entry.sc !== lastScene ? SceneTitle(entry.sc, lang) || entry.sc : null
    lastScene = entry.sc
    return <React.Fragment key={i}>
      {heading && <div className="backlog-scene">{heading}</div>}
      <p className="backlog-page">{entry.t}</p>
    </React.Fragment>
  })

  return <div className="backlog resizable-text" role="dialog" aria-modal="true" aria-label="Backlog">
    <header className="backlog-head">
      <h2>Log</h2>
      <span className="backlog-hint"><kbd>L</kbd> / <kbd>Esc</kbd> to close</span>
      {entries.length !== 0 &&
      <button type="button" className="backlog-clear" onClick={clearLog}>Clear</button>}
      <button type="button" className="backlog-close" ref={closeRef} onClick={onClose}>Close</button>
    </header>
    <div className="backlog-list" ref={listRef} tabIndex={-1}>
      {entries.length === 0 ?
        <p className="backlog-empty">Nothing here yet. Pages you read are collected here.</p> : rows}
    </div>
  </div>
}

export default Backlog
