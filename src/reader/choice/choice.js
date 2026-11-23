import React from "react"
import {Link} from "react-router-dom"
import {NextOf} from "../next"
import {IDToPath} from "../../resources/lookup"
import {recordChoice} from "../../progress/progress"
import {withOptions} from "../debug"
import "./choice.css"

// What the player can do at the end of a scene.  A real choice is a button per option.  When there is only one way
// on, the scrolling page shows a "Continue" button, while the paged readers (`choicesOnly`) don't show anything:
// they move on by themselves and say so (see reader.js).
const Choice = props => {
  if (!props.scriptID) {
    return null
  }

  const next = NextOf(props.scriptID, props.options.h, props.options.mature)
  if (!next || (next.goto && props.choicesOnly)) {
    return null
  }

  const lang = props.options.lang
  const buttons = next.choices || [{goto: next.goto}]

  return <div className="choice-block">
    {buttons.map((choice, i) => (
      <div key={i} style={{marginTop: "2em"}}>
        <Link to={"/" + IDToPath(choice.goto, lang)}>
          <button className="choice-button" onClick={() => recordChoice(props.scriptID, choice.goto, lang === "eng" ? choice.eng : choice.jp)}>
            {next.choices ? (lang === "eng" ? choice.eng : choice.jp) : (lang === "eng" ? "Continue" : "次へ")}
          </button>
        </Link>
      </div>
    ))}
  </div>
}

export default withOptions(Choice)
