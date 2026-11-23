import React, {useEffect, useState} from "react"
import {Link, useHistory} from "react-router-dom"
import {withOptions} from "../reader/debug"
import {leaveReader} from "../reader/toast/notice"
import {getResume} from "../progress/progress"
import {scripts} from "../resources/generated/scene-index"
import {IDToPath} from "../resources/lookup"
import Background from "./background/background"
import Graph from "./graph/graph"
import "./home-screen.css"

const ROUTES = [
  {id: "fate", label: "Fate", subtitle: "Saber"},
  {id: "ubw", label: "Unlimited Blade Works", subtitle: "Rin"},
  {id: "hf", label: "Heaven's Feel", subtitle: "Sakura"},
]

let Home = props => {
  const [showRoutes, setShowRoutes] = useState(false)
  const [routeSelected, setRouteSelected] = useState(false)
  const history = useHistory()
  const resume = getResume()
  const canContinue = !!(resume && scripts[resume.id])

  useEffect(() => { leaveReader() }, [])

  return <div className={"title-screen" + (routeSelected ? " route-active" : "")}>
    {props.options.tick}
    {!routeSelected && <Background/>}
    {!routeSelected && <div className="title-screen-shade" aria-hidden="true"/>}
    {!routeSelected && <main className="title-screen-content">
      <div className="title-screen-kicker">A visual novel by Type-Moon</div>
      <h1>Fate/stay night</h1>
    </main>}
    {showRoutes && <section className="title-route-panel" aria-label="Select a route">
      {ROUTES.map(route => <button key={route.id} type="button" className={"title-route route-" + route.id} onClick={() => {
        history.push("/" + route.id)
        setShowRoutes(false)
        setRouteSelected(true)
      }}>
        <span>{route.label}</span><small>{route.subtitle}</small>
      </button>)}
      <button type="button" className="title-route-back" onClick={() => setShowRoutes(false)}>Back</button>
    </section>}
    {routeSelected && <div className="route-view">
      <button type="button" className="route-view-home" onClick={() => { setRouteSelected(false); history.push("/") }}>‹ Main Menu</button>
      <Graph/>
    </div>}
    {!routeSelected && <footer className="title-footer">
      <nav className="title-menu" aria-label="Main menu">
        {canContinue && <Link className="title-menu-item" to={{pathname: "/" + IDToPath(resume.id, props.options.lang), hash: resume.hash || "", state: {resume: true}}}>Continue</Link>}
        <button className="title-menu-item title-menu-primary" type="button" onClick={() => setShowRoutes(v => !v)}>{showRoutes ? "Close Routes" : "Start / Select Route"}</button>
        <button className="title-menu-item" type="button" onClick={props.options.openMenu}>Settings</button>
        <Link className="title-menu-item" to="/project">Projects</Link>
      </nav>

    </footer>}
  </div>
}

Home = withOptions(Home)
export default Home
