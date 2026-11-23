import React, {useEffect, useState} from "react"
import {useHistory, useLocation} from "react-router-dom"
import {isMobileDevice} from "../mobile/mobile"
import {getProgressSummary, getSlots, saveSlot, loadSlot, clearSlot, getProgressSnapshot, importProgressSnapshot, getCurrentScene} from "../../progress/progress"
import {SceneTitle} from "../../resources/titles"
import "./menu.css"

// a group of mutually exclusive choices, shown as a row of words; the chosen one lights up
const Segmented = ({name, label, value, options, onChange}) => (
  <div className="seg" role="radiogroup" aria-label={label}>
    {options.map(option => (
      <label key={String(option.value)} className={"seg-item" + (String(option.value) === String(value) ? " is-on" : "")}>
        <input type="radio"
               name={name}
               value={String(option.value)}
               checked={String(option.value) === String(value)}
               onChange={() => onChange(option.value)}/>
        <span>{option.label}</span>
      </label>
    ))}
  </div>
)

const Slider = ({label, value, min, max, step, unit, onChange}) => {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="menu-row menu-row-slider">
      <label className="menu-label">
        <span>{label}</span>
        <output>{value}{unit}</output>
        <input type="range"
               className="slider"
               style={{"--fill": pct + "%"}}
               min={min}
               max={max}
               step={step}
               value={value}
               onChange={e => onChange(parseInt(e.target.value, 10))}/>
      </label>
    </div>
  )
}

const Row = ({label, hint, children}) => (
  <div className="menu-row">
    <div className="menu-label">
      <span>{label}</span>
      {hint && <small>{hint}</small>}
    </div>
    {children}
  </div>
)

// a faint Fate-style magic circle behind the settings
const Circle = () => (
  <svg className="menu-circle" viewBox="-110 -110 220 220" fill="none" stroke="currentColor" strokeWidth="0.6" aria-hidden="true">
    <circle r="104"/>
    <circle r="98" strokeDasharray="1.2 3.2"/>
    <circle r="78"/>
    <circle r="52"/>
    <path d="M0 -78 L67.5 39 L-67.5 39 Z"/>
    <path d="M0 78 L67.5 -39 L-67.5 -39 Z"/>
    <path d="M0 -104V104M-104 0H104" strokeOpacity="0.5"/>
    <circle r="6"/>
  </svg>
)

const TABS = [
  {id: "reading", label: "Reading"},
  {id: "audio", label: "Audio"},
  {id: "content", label: "Content"},
  {id: "controls", label: "Controls"},
  {id: "progress", label: "Progress"},
]

// one button per route; each opens the scene list on that route
const ROUTES = [
  {id: "fate", label: "Fate", sub: "Saber"},
  {id: "ubw", label: "Unlimited Blade Works", sub: "Rin"},
  {id: "hf", label: "Heaven's Feel", sub: "Sakura"},
]

const RouteButtons = ({onGo}) => {
  const location = useLocation()
  const here = (/^\/(fate|saber|セイバ|ubw|rin|凛|hf|sakura|桜)?\/?$/.exec(location.pathname) || [])[1]
  const current = {fate: "fate", saber: "fate", "セイバ": "fate", ubw: "ubw", rin: "ubw", "凛": "ubw", hf: "hf", sakura: "hf", "桜": "hf"}[here]
    || (/^\/?$/.test(location.pathname) ? "fate" : undefined)
  return <div className="menu-routes" role="group" aria-label="Routes">
    <div className="menu-routes-title">Routes</div>
    {ROUTES.map(route => (
      <button key={route.id}
              type="button"
              className={"menu-route" + (current === route.id && /^\/[^/]*$/.test(location.pathname) ? " is-here" : "")}
              data-route={route.id}
              onClick={() => onGo(route.id)}>
        <span className="menu-route-name">{route.label}</span>
        <small>{route.sub}</small>
      </button>
    ))}
  </div>
}

const Menu = props => {
  const [tab, setTab] = useState(0)
  const [slotRefresh, setSlotRefresh] = useState(0)
  const [saveMessage, setSaveMessage] = useState("")
  const [keyWarning, setKeyWarning] = useState("")
  const importRef = React.useRef(null)
  const history = useHistory()
  const goRoute = id => {
    history.push("/" + id)
    props.onClose()
  }
  const set = key => value => props.setSaveState({[key]: value})
  const bindingKeys = ["keyNext", "keyPrevious", "keyAuto", "keySkip", "keyHide", "keyBacklog"]
  const updateBinding = (key, value) => {
    const conflict = bindingKeys.find(other => other !== key && props[other] === value)
    if (conflict) {
      setKeyWarning("That key is already assigned to " + ({keyNext: "Advance text", keyPrevious: "Go back", keyAuto: "Auto mode", keySkip: "Skip mode", keyHide: "Hide interface", keyBacklog: "Backlog"}[conflict]) + ". Choose a different key first.")
      return
    }
    setKeyWarning("")
    set(key)(value)
  }
  const num = key => parseInt(props[key], 10) || 0
  const nvl = props.readMode === "nvl"
  const keyOptions = [
    {label: "Right arrow", value: "ArrowRight"}, {label: "Left arrow", value: "ArrowLeft"},
    {label: "D", value: "KeyD"}, {label: "A", value: "KeyA"},
    {label: "J", value: "KeyJ"}, {label: "K", value: "KeyK"},
    {label: "Q", value: "KeyQ"}, {label: "E", value: "KeyE"},
    {label: "S", value: "KeyS"}, {label: "H", value: "KeyH"},
    {label: "L", value: "KeyL"}, {label: "F", value: "KeyF"},
  ]
  const saveFile = () => {
    const data = getProgressSnapshot()
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"})
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "fate-stay-night-save-" + new Date().toISOString().slice(0, 10) + ".json"
    document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url)
    setSaveMessage("Save file exported.")
  }
  const readSaveFile = event => {
    const file = event.target.files && event.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setSaveMessage("This save file is larger than the 2 MB import limit.")
      event.target.value = ""
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      try {
        importProgressSnapshot(JSON.parse(reader.result))
        setSaveMessage("Save imported. Reloading the reader…")
        window.setTimeout(() => window.location.reload(), 500)
      } catch (error) { setSaveMessage(error.message || "Could not import this save file.") }
      event.target.value = ""
    }
    reader.onerror = () => setSaveMessage("Could not read the selected file.")
    reader.readAsText(file)
  }
  const saveToSlot = slot => {
    if (slots[String(slot)] && !window.confirm("Overwrite save slot " + slot + "?")) return
    setSaveMessage(saveSlot(slot) ? "Saved to slot " + slot + "." : "Browser storage is full; the slot could not be saved.")
    setSlotRefresh(v => v + 1)
  }
  const restoreSlot = slot => {
    if (loadSlot(slot)) { setSaveMessage("Loaded slot " + slot + ". Reloading…"); window.setTimeout(() => window.location.reload(), 500) }
  }
  const progress = getProgressSummary()
  const slots = getSlots()

  // ↑ / ↓ move through the list, like the pad in the console menus (leave the arrow keys alone while a control has focus)
  useEffect(() => {
    if (!props.visible) {
      return undefined
    }
    const onKey = e => {
      const tag = e.target && e.target.tagName
      if (["INPUT", "SELECT", "TEXTAREA"].includes(tag) || (e.keyCode !== 38 && e.keyCode !== 40)) {
        return
      }
      e.preventDefault()
      setTab(t => (t + (e.keyCode === 40 ? 1 : TABS.length - 1)) % TABS.length)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [props.visible])

  const body = {
    reading: <>
      <Row label="Mode" hint="How the text is laid out">
        <Segmented name="readMode" label="Reading mode" value={props.readMode} onChange={set("readMode")}
                   options={[{label: "NVL", value: "nvl"}, {label: "Textbox", value: "vn"}, {label: "Scrolling", value: "scroll"}]}/>
      </Row>
      {isMobileDevice() &&
      <Row label="Force landscape" hint="Fullscreen + rotate prompt while reading">
        <Segmented name="landscape" label="Force landscape" value={props.landscape} onChange={set("landscape")}
                   options={[{label: "On", value: true}, {label: "Off", value: false}]}/>
      </Row>}
      {props.readMode !== "scroll" && <>
        <Row label="Auto speed" hint="How long Auto waits before the next page">
          <Segmented name="autoSpeed" label="Auto speed" value={props.autoSpeed} onChange={set("autoSpeed")}
                     options={[{label: "Slow", value: "slow"}, {label: "Normal", value: "normal"}, {label: "Fast", value: "fast"}]}/>
        </Row>
        <Slider label={nvl ? "Overlay darkness" : "Text box opacity"} min={20} max={100} step={5} unit="%"
                value={num("boxOpacity")} onChange={set("boxOpacity")}/>
      </>}
    </>,
    audio: <>
      <Slider label="Voices" min={0} max={100} step={5} unit="%" value={num("voice")} onChange={set("voice")}/>
      <Slider label="Effects" min={0} max={100} step={5} unit="%" value={num("sound")} onChange={set("sound")}/>
      <Slider label="Music" min={0} max={100} step={5} unit="%" value={num("bgm")} onChange={set("bgm")}/>
      <Row label="Music version">
        <Segmented name="bgmVersion" label="Music version" value={props.bgmVersion} onChange={set("bgmVersion")}
                   options={[{label: "Vita", value: "vita"}, {label: "PS2", value: "ps2"}, {label: "Original", value: "original"}]}/>
      </Row>
    </>,
    content: <>
      <Row label="Language">
        <Segmented name="lang" label="Language" value={props.lang} onChange={set("lang")}
                   options={[{label: "English", value: "eng"}, {label: "日本語", value: "jp"}]}/>
      </Row>
      <Row label="Mature images">
        <Segmented name="mature" label="Mature images" value={props.mature} onChange={set("mature")}
                   options={[{label: "Show", value: true}, {label: "Hide", value: false}]}/>
      </Row>
      <Row label="H scenes">
        <Segmented name="h" label="H scenes" value={props.h} onChange={value => set("h")(parseInt(value, 10) || 0)}
                   options={[{label: "Censor", value: 0}, {label: "Uncensor", value: 1}, {label: "Decensor", value: 2}]}/>
      </Row>
    </>,
    controls: <>
      <Row label="Reading font" hint="Changes the dialogue and narration typeface">
        <select className="menu-select" value={props.fontFamily} onChange={e => set("fontFamily")(e.target.value)}>
          {[{label: "FateLine (default)", value: "FateLine"}, {label: "Georgia", value: "Georgia"}, {label: "Arial", value: "Arial"}, {label: "Verdana", value: "Verdana"}, {label: "Times New Roman", value: "Times New Roman"}].map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Row>
      <Slider label="Font size" min={80} max={150} step={5} unit="%" value={num("fontSize")} onChange={set("fontSize")}/>
      <div className="menu-subtitle">Keyboard shortcuts</div>
      {[{key: "keyNext", label: "Advance text"}, {key: "keyPrevious", label: "Go back"}, {key: "keyAuto", label: "Auto mode"}, {key: "keySkip", label: "Skip mode"}, {key: "keyHide", label: "Hide interface"}, {key: "keyBacklog", label: "Backlog"}].map(item => (
        <Row key={item.key} label={item.label}>
          <select className="menu-select" value={props[item.key]} onChange={e => updateBinding(item.key, e.target.value)}>
            {item.key === "keySkip" && <option value="ControlLeft">Ctrl (Control)</option>}
            {keyOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Row>
      ))}
      {keyWarning && <p className="menu-save-message" role="alert">{keyWarning}</p>}
      <p className="menu-note">Ctrl can be assigned as a standalone shortcut (use it for Skip). Enter, Space, and the arrow keys remain available as fallback navigation controls. Custom bindings must be unique.</p>
    </>,
    progress: <>
      <div className="menu-progress-summary">
        <strong>{progress.scenesVisited}</strong><span> scenes visited</span>
      </div>
      <div className="menu-progress-route"><div><span>Currently reading</span><b>{getCurrentScene() ? (SceneTitle(getCurrentScene(), props.lang) || getCurrentScene()) : "Not in a scene"}</b></div></div>
      {progress.routes.map(route => <div className="menu-progress-route" key={route.route}>
        <div><span>{route.route === "fate" ? "Fate / Saber" : route.route === "ubw" ? "Unlimited Blade Works" : "Heaven's Feel"}</span><b>{route.percent}%</b></div>
        <div className="menu-progress-track"><i style={{width: route.percent + "%"}}/></div>
        <small>{route.visited} of {route.total} indexed scenes visited</small>
      </div>)}
      <p className="menu-note">This measures scenes visited, not the original game's route flags, affection values, or ending conditions. Those mechanics are not fully simulated by this reader.</p>
      <div className="menu-subtitle">Save slots</div>
      {[1, 2, 3].map(slot => <div className="menu-slot" key={slot + "-" + slotRefresh}>
        <div><b>Slot {slot}</b><small>{slots[String(slot)] ? new Date(slots[String(slot)].exportedAt).toLocaleString() : "Empty"}</small></div>
        <div className="menu-slot-actions">
          <button type="button" onClick={() => saveToSlot(slot)}>Save</button>
          <button type="button" disabled={!slots[String(slot)]} onClick={() => restoreSlot(slot)}>Load</button>
          <button type="button" disabled={!slots[String(slot)]} onClick={() => {clearSlot(slot); setSlotRefresh(v => v + 1); setSaveMessage("Slot " + slot + " cleared.")}}>Clear</button>
        </div>
      </div>)}
      <div className="menu-save-actions">
        <button type="button" onClick={saveFile}>Export save file</button>
        <button type="button" onClick={() => importRef.current && importRef.current.click()}>Import save file</button>
        <input ref={importRef} type="file" accept="application/json,.json" onChange={readSaveFile} style={{display: "none"}}/>
      </div>
      {saveMessage && <p className="menu-save-message" role="status">{saveMessage}</p>}
    </>,
  }[TABS[tab].id]

  return <div className="menu resizable-text"
              role="dialog"
              aria-modal="true"
              aria-labelledby="menu-title"
              invisible={props.visible ? undefined : ""}>
    <Circle/>

    <nav className="menu-nav" aria-label="Settings sections">
      <h2 id="menu-title">Menu</h2>
      <ul>
        {TABS.map((t, i) => (
          <li key={t.id}>
            <button type="button"
                    className={"menu-item" + (i === tab ? " is-on" : "")}
                    aria-current={i === tab ? "true" : undefined}
                    onClick={() => setTab(i)}>
              {t.label}
            </button>
          </li>
        ))}
      </ul>
      <RouteButtons onGo={goRoute}/>
      <button type="button" className="menu-item" onClick={props.openLog}>Backlog</button>
      <button type="button" className="menu-item menu-back" onClick={props.onClose}>Back</button>
    </nav>

    <main className="menu-page">
      <header className="menu-page-head">
        <span className="menu-count">{tab + 1}/{TABS.length}</span>
        <h3>{TABS[tab].label}</h3>
      </header>
      <div className="menu-body" key={TABS[tab].id}>
        {body}
        {tab === 2 && <p className="menu-note">Language, content and reading mode reload the scene when you close this menu.</p>}
        {tab === 0 && <p className="menu-note">Reading mode reloads the scene when you close this menu.</p>}
      </div>
    </main>

    <footer className="menu-hints">
      <button type="button" onClick={props.onClose}><kbd>Esc</kbd> Back</button>
      <span className="menu-hint-keys"><kbd>↑</kbd><kbd>↓</kbd> Move</span>
      <button type="button" className="menu-done" onClick={props.onClose}><kbd>Enter</kbd> Confirm</button>
    </footer>
  </div>
}

export default Menu
