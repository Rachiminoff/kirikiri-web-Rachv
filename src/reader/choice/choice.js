import React from "react"
import {Link, withRouter} from "react-router-dom"
import {NextOf} from "../next"
import {IDToPath} from "../../resources/lookup"
import {SceneTitle} from "../../resources/titles"
import {graphLogic} from "../../resources/generated/scene-index"
import {recordChoice, getChoices, popChoice} from "../../progress/progress"
import {replaceGameFlags, markSceneEntered} from "../../progress/game-state"
import {carryModes} from "../toast/notice"
import {withOptions} from "../debug"
import "./choice.css"

const isTigerDojo = id => /^Tiger Dojo/i.test(SceneTitle(id, "eng"))

// every scene id a logic node can lead to, whatever the conditions (`then` holds another node)
const exits = node => {
  if (!node) return []
  if (typeof node === "string") return [node]
  const out = []
  if (node.goto) out.push(node.goto)
  ;(node.conditions || []).forEach(c => c && out.push(...exits(c.then)))
  ;(node.choices || []).forEach(c => c && out.push(...exits(c.then)))
  return out
}

// can `target` be reached by reading on from `start`?
const reaches = (start, target) => {
  const seen = new Set([start])
  const queue = [start]
  while (queue.length && seen.size < 4000) {
    const id = queue.shift()
    if (id === target) return true
    exits(graphLogic[id]).forEach(n => { if (!seen.has(n)) { seen.add(n); queue.push(n) } })
  }
  return false
}

// the most recent choice that led here
const lastChoiceBefore = sceneID => {
  const all = getChoices()
  const last = all[all.length - 1]
  return last && last.from && reaches(last.to, sceneID) ? last : null
}

// What the player can do at the end of a scene.  A real choice is a button per option.  When there is only one way
// on, the scrolling page shows a "Continue" button, while the paged readers (`choicesOnly`) don't show anything:
// they move on by themselves and say so (see reader.js).  At the end of a Tiger Dojo (bad end) there is also a
// way back to the last choice, with the flags put back as they were.
const Choice = props => {
  if (!props.scriptID) {
    return null
  }

  const lang = props.options.lang
  const next = NextOf(props.scriptID, props.options.h, props.options.mature)

  let back = null
  if (!next && isTigerDojo(props.scriptID)) {
    back = lastChoiceBefore(props.scriptID)
  }

  if (back) {
    const jp = lang !== "eng"
    const go = () => {
      const c = popChoice()
      if (c.flags) replaceGameFlags(c.flags)
      markSceneEntered(c.from)
      carryModes({skip: true})
      props.history.push("/" + IDToPath(c.from, lang))
    }
    return <div className="choice-block">
      <div style={{marginTop: "2em"}}>
        <button className="choice-button choice-back" onClick={go}>
          {jp ? "選択肢に戻る" : "Return to the last choice"}
        </button>
        {back.label ? <div className="choice-back-note">{(jp ? "選んだ: " : "You chose: ") + back.label}</div> : null}
      </div>
    </div>
  }

  if (!next || (next.goto && props.choicesOnly)) {
    return null
  }

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

export default withRouter(withOptions(Choice))
