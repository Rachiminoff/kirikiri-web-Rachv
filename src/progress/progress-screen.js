import React from "react"
import {getProgressSummary, getSlots, saveSlot, loadSlot, clearSlot} from "./progress"
import {SceneTitle} from "../resources/titles"
import "./progress-screen.css"

const ProgressScreen = ({visible, onClose, sceneID, lang}) => {
  if (!visible) return null
  const progress = getProgressSummary()
  const slots = getSlots()
  const save = slot => {
    if (slots[String(slot)] && !window.confirm("Overwrite save slot " + slot + "?")) return
    if (saveSlot(slot)) window.location.reload()
    else window.alert("Browser storage is full. The save could not be created.")
  }
  const load = slot => {
    if (window.confirm("Load save slot " + slot + "? Your current progress will be replaced.")) {
      if (loadSlot(slot)) window.location.reload()
    }
  }
  return <div className="progress-screen" role="dialog" aria-modal="true" aria-labelledby="progress-screen-title">
    <div className="progress-screen-panel">
      <header><div><small>FATE/STAY NIGHT</small><h2 id="progress-screen-title">Progress</h2></div><button type="button" onClick={onClose} aria-label="Close progress">×</button></header>
      <div className="progress-screen-current"><small>CURRENT SCENE</small><strong>{sceneID ? (SceneTitle(sceneID, lang) || sceneID) : "Scene unavailable"}</strong><span>{sceneID || "Custom script"}</span></div>
      <div className="progress-screen-stats"><div><strong>{progress.scenesVisited}</strong><span>Scenes visited</span></div><div><strong>{progress.endings.length}</strong><span>Endings recorded</span></div></div>
      <section><h3>Route progress</h3>{progress.routes.map(route => <div className="progress-screen-route" key={route.route}><div><b>{route.route === "fate" ? "Fate / Saber" : route.route === "ubw" ? "Unlimited Blade Works" : "Heaven's Feel"}</b><span>{route.unlocked ? "Unlocked" : "Not reached"} · {route.visited}/{route.total} · {route.percent}%</span></div><div className="progress-screen-track"><i style={{width: route.percent + "%"}}/></div></div>)}</section>
      <section><h3>Affection values</h3>{progress.affection.length ? <div className="progress-screen-affection">{progress.affection.map(item => <div key={item.key}><span>{item.label}</span><b>{item.value}</b></div>)}</div> : <p className="progress-screen-empty">No affection values recorded yet. They appear as you reach scenes that update them.</p>}</section>
      <section><h3>Ending completion</h3>{progress.endings.length ? <ul className="progress-screen-endings">{progress.endings.map(name => <li key={name}>{name}</li>)}</ul> : <p className="progress-screen-empty">No route-clear or ending flags recorded yet.</p>}</section>
      <section><h3>Save slots</h3><div className="progress-screen-slots">{[1,2,3].map(slot => <div key={slot}><span><b>Slot {slot}</b><small>{slots[String(slot)] ? new Date(slots[String(slot)].exportedAt).toLocaleString() : "Empty"}</small></span><button type="button" onClick={() => save(slot)}>Save</button><button type="button" disabled={!slots[String(slot)]} onClick={() => load(slot)}>Load</button><button type="button" disabled={!slots[String(slot)]} onClick={() => {if(window.confirm("Clear slot " + slot + "?")){clearSlot(slot); window.location.reload()}}}>Clear</button></div>)}</div></section>
      <p className="progress-screen-note">Progress is stored in this browser. Route percentages count indexed scenes visited; affection and ending records reflect flags currently tracked by this reader.</p>
      <footer><button type="button" onClick={onClose}>Return to story</button></footer>
    </div>
  </div>
}
export default ProgressScreen
