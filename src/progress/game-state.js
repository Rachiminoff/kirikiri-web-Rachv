// Replays the route/affection flags encoded in the generated scene graph.
// Conditions are deliberately parsed (never eval'd) and support the operators present in that data.
import {graphLogic} from "../resources/generated/scene-index"

const KEY = "fate.game-state.v1"
const ENTRY_KEY = "fate.last-entered-scene.v1"
const read = () => {
  try {
    const value = JSON.parse(window.localStorage.getItem(KEY) || "{}")
    return value && typeof value === "object" && !Array.isArray(value) ? value : {}
  } catch (e) { return {} }
}
let flags = typeof window === "undefined" ? {} : read()
const persist = () => {
  try { window.localStorage.setItem(KEY, JSON.stringify(flags)) } catch (e) {}
}
export const getGameFlags = () => Object.assign({}, flags)
export const replaceGameFlags = next => {
  flags = next && typeof next === "object" && !Array.isArray(next) ? Object.assign({}, next) : {}
  persist()
}
export const resetGameFlags = () => { flags = {}; persist() }

const splitExpression = (input, operator) => {
  let depth = 0
  for (let i = 0; i <= input.length - operator.length; i++) {
    if (input[i] === "(" ) depth++
    else if (input[i] === ")") depth--
    if (depth === 0 && input.slice(i, i + operator.length) === operator) {
      return [input.slice(0, i).trim(), input.slice(i + operator.length).trim()]
    }
  }
  return null
}
const valueOf = (raw, state) => {
  const value = raw.trim().replace(/^\((.*)\)$/, "$1")
  if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value)
  if (Object.prototype.hasOwnProperty.call(state, value)) return Number(state[value]) || 0
  return 0
}
export const evaluateCondition = (expression, state = flags) => {
  if (!expression || typeof expression !== "string") return true
  const or = splitExpression(expression, "||")
  if (or) return evaluateCondition(or[0], state) || evaluateCondition(or[1], state)
  const and = splitExpression(expression, "&&")
  if (and) return evaluateCondition(and[0], state) && evaluateCondition(and[1], state)
  const match = /^(.+?)(==|!=|>=|<=|>|<)(.+)$/.exec(expression.trim())
  if (!match) return false
  const left = valueOf(match[1], state), right = valueOf(match[3], state)
  switch (match[2]) {
    case "==": return left === right
    case "!=": return left !== right
    case ">=": return left >= right
    case "<=": return left <= right
    case ">": return left > right
    case "<": return left < right
    default: return false
  }
}
export const applySceneUpdates = sceneID => {
  const logic = graphLogic[sceneID]
  if (!logic || !Array.isArray(logic.update)) return false
  logic.update.forEach(update => {
    const match = /^(.+?)(\+=|-=|=)(-?\d+(?:\.\d+)?)$/.exec(update.trim())
    if (!match) return
    const key = match[1].trim(), amount = Number(match[3]), current = Number(flags[key]) || 0
    flags[key] = match[2] === "+=" ? current + amount : match[2] === "-=" ? current - amount : amount
  })
  persist()
  return true
}
// A scene's update is applied once on entry. sessionStorage prevents a refresh from replaying the same entry,
// while moving to another scene and returning later correctly applies it again.
export const enterGameScene = sceneID => {
  if (!sceneID || typeof window === "undefined") return
  try {
    if (window.sessionStorage.getItem(ENTRY_KEY) === sceneID) return
    applySceneUpdates(sceneID)
    window.sessionStorage.setItem(ENTRY_KEY, sceneID)
  } catch (e) { applySceneUpdates(sceneID) }
}
export const clearEntryMarker = () => {
  try { window.sessionStorage.removeItem(ENTRY_KEY) } catch (e) {}
}
