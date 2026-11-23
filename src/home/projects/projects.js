import React from "react"
import {Link} from "react-router-dom"
import Introduction from "../introduction/introduction"
import Discord from "../links/images/Discord-Logo-White.svg"
import Github from "../links/images/Github-Mark.svg"
import Reddit from "../links/images/Reddit_Mark_OnDark.svg"
import "./projects.css"

const COMMUNITY = [
  {name: "Discord", note: "Feedback and bug reports", href: "https://discord.gg/ejespgUpgg", icon: Discord},
  {name: "GitHub", note: "Source code", href: "https://github.com/Kent-H/kirikiri-web", icon: Github},
  {name: "Reddit", note: "Community thread", href: "https://www.reddit.com/r/fatestaynight/comments/qbccnu/web_version_of_fatestay_night/", icon: Reddit},
]

const Projects = () => <div className="projects-page">
  <nav className="projects-nav" aria-label="Page navigation">
    <Link to="/" className="projects-back">‹ Main Menu</Link>
  </nav>
  <main className="projects-main">
    <header className="projects-header">
      <div className="projects-kicker">FATE / STAY NIGHT</div>
      <h1>Project Information</h1>
      <p>How to use the reader, acknowledgements, and community links</p>
    </header>

    <section className="projects-content" aria-label="Details">
      <Introduction/>
    </section>

    <section className="projects-community" aria-label="Community and project links">
      <h2>Community &amp; project links</h2>
      <div className="projects-community-grid">
        {COMMUNITY.map(link => <a key={link.name} className="projects-community-card" href={link.href} target="_blank" rel="noopener noreferrer">
          <img src={link.icon} alt="" width="28" height="28"/>
          <span><b>{link.name}</b><small>{link.note}</small></span>
        </a>)}
      </div>
    </section>
  </main>
</div>

export default Projects
