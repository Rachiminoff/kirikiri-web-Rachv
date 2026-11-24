import React, {useEffect, useMemo, useRef, useState} from "react"
import {ROUTES} from "./guide-data"
import "./guide.css"

const STORE_ROUTE = "fate.guide.route.v1"
const STORE_MINOR = "fate.guide.minor.v1"
const readStore = (key, fallback) => {
  try { const v = window.localStorage.getItem(key); return v === null ? fallback : v } catch (e) { return fallback }
}
const writeStore = (key, value) => { try { window.localStorage.setItem(key, value) } catch (e) {} }

const chipKind = text => (
  /^Rin/.test(text) ? "rin" : /^Saber/.test(text) ? "saber" : /^Sakura/.test(text) ? "sakura"
    : /^Illya/.test(text) ? "illya" : /^Heaven/.test(text) ? "hf" : "flag"
)
const Chip = ({text}) => <span className={"gd-chip gd-chip-" + chipKind(text)}>{text}</span>
const BadChip = ({bad}) => <span className="gd-chip gd-chip-bad" title={bad.name}>Tiger Dojo {bad.n}</span>

// One leg of a fork: a plate for the option, with the tree lines above (and below, unless it ends the run).
const Leg = ({o}) => (
  <div className={"gf-leg" + (o.bad ? " is-bad" : "") + (o.pick ? " is-pick" : "")}>
    <i className="gf-bus gf-bus-top" aria-hidden="true"/>
    <div className="gf-plate gf-opt">
      {o.pick && <span className="gf-star" aria-hidden="true">★</span>}
      <span className="sr-only">{o.pick ? "Recommended: " : o.bad ? "Bad end: " : ""}</span>
      {o.when && <span className="gd-when">{o.when}</span>}
      <div className="gf-opt-text">“{o.t}”</div>
      <div className="gf-opt-res">{o.r}{o.fx && o.fx.map(f => <Chip key={f} text={f}/>)}</div>
      {o.note && <div className="gf-opt-note">{o.note}</div>}
    </div>
    {o.bad
      ? <><i className="gf-stub" aria-hidden="true"/><div className="gf-end" title={o.bad.name}><b>Tiger Dojo {o.bad.n}</b><span>{o.bad.name}</span></div></>
      : <><i className="gf-grow" aria-hidden="true"/><i className="gf-bus gf-bus-bot" aria-hidden="true"/></>}
  </div>
)

const Down = () => <div className="gf-down" aria-hidden="true"/>

const Item = ({item, showMinor, last}) => {
  if (item.type === "note") return <><p className="gf-note">{item.text}</p></>
  if (item.type === "check") {
    return <div className={"gf-stage" + (last ? " is-last" : "")}>
      <div className="gf-plate gf-check">
        <div className="gf-where">{item.where} <em>automatic check</em></div>
        <code>{item.cond}</code>
        {item.note && <div className="gf-opt-note">{item.note}</div>}
      </div>
      <div className="gf-branch">
        <div className={"gf-leg" + (item.bad ? " is-bad" : "")}>
          <i className="gf-bus gf-bus-top" aria-hidden="true"/>
          <div className="gf-plate gf-opt"><span className="gf-yn">Yes</span><div className="gf-opt-res">{item.yes}</div></div>
          {item.bad
            ? <><i className="gf-stub" aria-hidden="true"/><div className="gf-end" title={item.bad.name}><b>Tiger Dojo {item.bad.n}</b><span>{item.bad.name}</span></div></>
            : <><i className="gf-grow" aria-hidden="true"/><i className="gf-bus gf-bus-bot" aria-hidden="true"/></>}
        </div>
        <div className="gf-leg is-pick">
          <i className="gf-bus gf-bus-top" aria-hidden="true"/>
          <div className="gf-plate gf-opt"><span className="gf-yn">No</span><div className="gf-opt-res">{item.no}</div></div>
          <><i className="gf-grow" aria-hidden="true"/><i className="gf-bus gf-bus-bot" aria-hidden="true"/></>
        </div>
      </div>
      <Down/>
    </div>
  }
  if (item.minor && !showMinor) return null
  return <div className={"gf-stage" + (item.minor ? " is-minor" : "") + (last ? " is-last" : "")}>
    <div className="gf-plate gf-decision">
      <div className="gf-where">{item.where}{item.minor && <em>no effect on the story</em>}</div>
      {item.note && <div className="gf-opt-note">{item.note}</div>}
    </div>
    <div className="gf-line" aria-hidden="true"/>
    <div className="gf-branch">{item.options.map((o, i) => <Leg key={i} o={o}/>)}</div>
    <Down/>
  </div>
}

const Overview = ({go}) => (
  <div className="gd-overview">
    <p className="gd-lead">A choice-by-choice walkthrough for every route. Pick a route above, jump to a day, and follow the glowing ★ path down the chart.</p>

    <h4>How to read it</h4>
    <ul className="gd-legend">
      <li><span className="gd-mark is-pick" aria-hidden="true">★</span> the option you want: a glowing plate on the path to follow</li>
      <li><span className="gd-mark is-bad" aria-hidden="true">✕</span> a red cloud ends the branch: a bad end <BadChip bad={{n: "N", name: "Bad end"}}/></li>
      <li><span className="gd-mark" aria-hidden="true">◇</span> an amber diamond is an automatic check that forks into Yes / No</li>
      <li><Chip text="Rin +1"/><Chip text="Saber +2"/><Chip text="Sakura +5"/><Chip text="Illya +3"/> affection counters</li>
      <li><Chip text="Geas = 1"/> a story flag that matters later</li>
      <li><span className="gd-code">Saber &lt; 6</span> an automatic check, not a choice: reach the threshold earlier or you get the bad end</li>
    </ul>

    <h4>Which route you enter</h4>
    <div className="gd-flow">
      <div className="gd-flow-start"><b>Common route</b><span>Days 1 – 3</span></div>
      <i className="gf-down" aria-hidden="true"/>
      <button type="button" className="gd-flow-step" onClick={() => go("fate")} style={{"--c": "#a8c3eb"}}>
        <b>Fate</b><span>The default after the Common route. Clear this first.</span>
      </button>
      <i className="gf-down" aria-hidden="true"/>
      <button type="button" className="gd-flow-step" onClick={() => go("ubw")} style={{"--c": "#f19c99"}}>
        <b>Unlimited Blade Works</b><span>After Fate is cleared, choose <i>"Stop."</i> on Day 3.</span>
      </button>
      <i className="gf-down" aria-hidden="true"/>
      <button type="button" className="gd-flow-step" onClick={() => go("hf")} style={{"--c": "#c3a8d8"}}>
        <b>Heaven's Feel</b><span>After UBW is cleared, reach Heaven's Feel = 3 by Day 3 night.</span>
      </button>
    </div>

    <h4>Heaven's Feel checklist (Common route)</h4>
    <ol className="gd-steps">
      <li>Day 1 morning: <i>"I'll go help Sakura."</i></li>
      <li>Day 1 night: <i>"I'll walk Sakura home."</i> (adds Heaven's Feel +1 once UBW is cleared)</li>
      <li>Day 2 morning: <i>"Sakura's coming, so I should add another dish."</i> (+1)</li>
      <li>Day 2 after school: <i>"Explain everything to Sakura."</i> (+1, total 3)</li>
    </ol>

    <h4>Endings</h4>
    <ul className="gd-endings">
      {ROUTES.filter(r => r.ending).map(r => <li key={r.id}><b style={{color: r.accent}}>{r.label}</b> {r.ending}</li>)}
    </ul>

    <h4>Good to know</h4>
    <ul className="gd-tips">
      <li>Bad ends are numbered Tiger Dojo 1 – 40. The scene that triggers each one is named next to its badge.</li>
      <li>Choices that only change a line or two of dialogue are hidden by default. Turn on "Show minor choices" to see them.</li>
      <li>Affection points carry through the route. Where a route needs a minimum, it says so in its "Key points" box.</li>
    </ul>
    <p className="gd-credit">Based on the Common, Fate, Unlimited Blade Works and Heaven's Feel flowcharts.</p>
  </div>
)

const Guide = () => {
  const [routeId, setRouteId] = useState(() => {
    const saved = readStore(STORE_ROUTE, "overview")
    return ROUTES.some(r => r.id === saved) ? saved : "overview"
  })
  const [showMinor, setShowMinor] = useState(() => readStore(STORE_MINOR, "0") === "1")
  const wrap = useRef(null)
  const dayRefs = useRef({})
  const route = ROUTES.find(r => r.id === routeId) || ROUTES[0]

  // Enter confirms and closes the settings menu; inside the guide it should just press the focused button.
  useEffect(() => {
    const el = wrap.current
    if (!el) return undefined
    const onKey = e => { if (e.keyCode === 13) e.stopPropagation() }
    el.addEventListener("keydown", onKey)
    return () => el.removeEventListener("keydown", onKey)
  }, [])

  const selectRoute = id => {
    setRouteId(id)
    writeStore(STORE_ROUTE, id)
    const body = wrap.current && wrap.current.closest(".menu-body")
    if (body) body.scrollTop = 0
  }
  const toggleMinor = () => { const next = !showMinor; setShowMinor(next); writeStore(STORE_MINOR, next ? "1" : "0") }
  // scroll only the menu's own panel (scrollIntoView would also shift the fixed, overflow-hidden menu itself)
  const jump = key => {
    const el = dayRefs.current[key]
    const body = wrap.current && wrap.current.closest(".menu-body")
    if (!el || !body) return
    const bar = wrap.current.querySelector(".gd-toolbar")
    const top = el.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - (bar ? bar.offsetHeight : 0)
    body.scrollTo({top: Math.max(0, top), behavior: "smooth"})
  }

  const visibleCount = useMemo(() => {
    const counts = {}
    if (route.days) route.days.forEach(d => { counts[d.day] = d.items.filter(i => i.type !== "choice" || !i.minor || showMinor).length })
    return counts
  }, [route, showMinor])

  return <div className="gd" ref={wrap} style={{"--gd-accent": route.accent || "#8fd8ff"}}>
    <div className="gd-routes" role="tablist" aria-label="Guide routes">
      {ROUTES.map(r => (
        <button key={r.id} type="button" role="tab" aria-selected={r.id === routeId}
                className={"gd-route" + (r.id === routeId ? " is-on" : "")}
                style={{"--c": r.accent || "#8fd8ff"}} onClick={() => selectRoute(r.id)}>
          {r.label}
        </button>
      ))}
    </div>

    {route.id === "overview" ? <Overview go={selectRoute}/> : <>
      <p className="gd-lead">{route.intro}</p>
      <div className="gd-key">
        <h4>Key points</h4>
        <ul>{route.key.map((k, i) => <li key={i}>{k}</li>)}</ul>
      </div>

      <div className="gd-toolbar">
        <div className="gd-days" aria-label="Jump to day">
          {route.days.map(d => <button type="button" key={d.day} onClick={() => jump(route.id + d.day)}>{d.day.replace("Day ", "D").replace("Final Day", "Final")}</button>)}
        </div>
        <label className="gd-toggle">
          <input type="checkbox" checked={showMinor} onChange={toggleMinor}/> <span>Show minor choices</span>
        </label>
      </div>

      {route.days.map(d => (
        <section className="gd-day gf" key={route.id + d.day} ref={el => { dayRefs.current[route.id + d.day] = el }}>
          <h4><span>{d.day}</span> {d.title}</h4>
          {visibleCount[d.day] === 0 && <p className="gd-empty">Nothing here changes the route. Enjoy the story.</p>}
          {(() => {
            // the last chart stage of the day has nothing after it, so no line is drawn below it
            let lastStage = -1
            d.items.forEach((it, i) => { if (it.type !== "note" && (it.type !== "choice" || !it.minor || showMinor)) lastStage = i })
            return d.items.map((item, i) => <Item key={i} item={item} showMinor={showMinor} last={i === lastStage}/>)
          })()}
        </section>
      ))}
    </>}
  </div>
}

export default Guide
