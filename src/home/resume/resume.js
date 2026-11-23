import React from "react"
import {Link} from "react-router-dom"
import {getResume} from "../../progress/progress"
import {withOptions} from "../../reader/debug"
import {IDToPath} from "../../resources/lookup"
import {scripts} from "../../resources/generated/scene-index"
import {SceneTitle} from "../../resources/titles"
import "./resume.css"

const ago = ts => {
  const minutes = Math.max(0, Math.round((Date.now() - ts) / 60000))
  if (minutes < 2) {
    return "just now"
  }
  if (minutes < 60) {
    return minutes + " minutes ago"
  }
  const hours = Math.round(minutes / 60)
  if (hours < 24) {
    return hours === 1 ? "an hour ago" : hours + " hours ago"
  }
  const days = Math.round(hours / 24)
  return days === 1 ? "yesterday" : days + " days ago"
}

// "Pick up where you left off": the last scene, section and page the reader was on (kept in localStorage).
const Resume = props => {
  const resume = getResume()
  if (!resume || !scripts[resume.id]) {
    return null
  }
  const lang = props.options.lang
  const title = SceneTitle(resume.id, lang) || resume.id
  return <div className="resume">
    <Link className="resume-card"
          to={{pathname: "/" + IDToPath(resume.id, lang), hash: resume.hash || "", state: {resume: true}}}>
      <span className="resume-eyebrow">Where you left off</span>
      <span className="resume-title">{title}</span>
      <span className="resume-meta">{resume.ts ? ago(resume.ts) : ""}</span>
    </Link>
  </div>
}

export default withOptions(Resume)
