import {graphLogic} from "../resources/generated/scene-index"
import {evaluateCondition, getGameFlags} from "../progress/game-state"

const hRegex = /^[^-]+-1\d\d$/
const isH = logic => !!(logic && logic.goto && hRegex.test(logic.goto))

// Conditions are evaluated against the persistent game flags generated from the original route graph.
export const resolveLogic = (logic, h, flags = getGameFlags()) => {
  if (!logic) return null
  if (logic.goto) return isH(logic) && !h ? null : {goto: logic.goto}
  if (logic.conditions) {
    const picked = logic.conditions.find(branch => branch.if && evaluateCondition(branch.if, flags)) ||
      logic.conditions.find(branch => !branch.if)
    return picked ? resolveLogic(picked.then, h, flags) : null
  }
  if (logic.choices) {
    const choices = logic.choices.reduce((acc, choice) => {
      const then = resolveLogic(choice.then, h, flags)
      if (then && then.goto) acc.push({eng: choice.eng, jp: choice.jp, goto: then.goto})
      return acc
    }, [])
    return choices.length ? {choices} : null
  }
  return null
}
export const NextOf = (sceneID, h, mature) => resolveLogic(graphLogic[sceneID], h, Object.assign({}, getGameFlags(), {ghentai: h ? 1 : 0, gmature: mature ? 1 : 0}))
