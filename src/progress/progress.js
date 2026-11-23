// Persistent, versioned browser-side progression. This is intentionally separate from the browser's HTTP cache:
// cache entries may be evicted, while localStorage is the durable lightweight save store.
import {graphLogic} from "../resources/generated/scene-index"
import {getGameFlags, replaceGameFlags} from "./game-state"

const RESUME_KEY = "fate.resume.v1"
const READ_KEY = "fate.read.v1"
const LOG_KEY = "fate.backlog.v1"
const CHOICES_KEY = "fate.choices.v1"
const SLOTS_KEY = "fate.slots.v1"
const BACKUP_KEY = "fate.pre-import-backup.v1"
const CURRENT_SCENE_KEY = "fate.current-scene.v1"
const PLAYTIME_KEY = "fate.playtime-ms.v1"
let playtimeStartedAt = null
let playtimeTimer = null
export const SAVE_VERSION = 2
export const LOG_MAX = 400
const SETTINGS_COOKIE_KEYS = ["bgm", "voice", "sound", "bgmVersion", "lang", "mature", "h", "readMode", "autoSpeed", "boxOpacity", "landscape", "fontFamily", "fontSize", "keyNext", "keyPrevious", "keyAuto", "keySkip", "keyHide", "keyBacklog"]

const load = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (e) { return fallback }
}
const save = (key, value) => {
  try { window.localStorage.setItem(key, JSON.stringify(value)); return true }
  catch (e) { return false }
}
const remove = key => { try { window.localStorage.removeItem(key) } catch (e) {} }

export const setCurrentScene = id => { if (id) save(CURRENT_SCENE_KEY, id) }
export const getCurrentScene = () => load(CURRENT_SCENE_KEY, null)

export const getPlaytime = () => {
  const stored = Number(load(PLAYTIME_KEY, 0)) || 0
  return stored + (playtimeStartedAt === null ? 0 : Math.max(0, Date.now() - playtimeStartedAt))
}
const persistPlaytime = () => {
  if (playtimeStartedAt !== null) {
    const elapsed = getPlaytime()
    save(PLAYTIME_KEY, elapsed)
    playtimeStartedAt = Date.now()
  }
}
export const startPlaytime = () => {
  if (playtimeStartedAt !== null) return
  playtimeStartedAt = Date.now()
  playtimeTimer = setInterval(persistPlaytime, 1000)
}
export const stopPlaytime = () => {
  if (playtimeStartedAt === null) return
  persistPlaytime()
  playtimeStartedAt = null
  clearInterval(playtimeTimer)
  playtimeTimer = null
}

export const getResume = () => {
  const r = load(RESUME_KEY, null)
  return r && typeof r.id === "string" ? r : null
}
export const saveResume = resume => save(RESUME_KEY, Object.assign({}, resume, {ts: Date.now()}))
export const clearResume = () => remove(RESUME_KEY)

let readCache
const readSet = () => {
  if (!readCache) readCache = load(READ_KEY, {}) || {}
  return readCache
}
export const markRead = id => {
  if (id && !readSet()[id]) {
    readSet()[id] = 1
    save(READ_KEY, readCache)
  }
}
export const isRead = id => !!readSet()[id]
export const getReadScenes = () => Object.keys(readSet()).filter(id => readSet()[id])

let logCache
let logTimer
const listeners = []
const log = () => {
  if (!logCache) {
    const stored = load(LOG_KEY, [])
    logCache = Array.isArray(stored) ? stored : []
  }
  return logCache
}
const flushLog = () => {
  clearTimeout(logTimer)
  logTimer = undefined
  if (logCache) save(LOG_KEY, logCache)
}
if (typeof window !== "undefined") {
  window.addEventListener("pagehide", flushLog)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushLog()
  })
}
export const getLog = () => log()
export const pushLog = (sc, sec, text) => {
  text = (text || "").trim()
  if (!text) return
  const entries = log()
  for (let i = entries.length - 1; i >= 0 && i >= entries.length - 60; i--) {
    if (entries[i].sc === sc && entries[i].sec === sec && entries[i].t === text) return
  }
  entries.push({sc, sec, t: text, ts: Date.now()})
  if (entries.length > LOG_MAX) entries.splice(0, entries.length - LOG_MAX)
  if (logTimer === undefined) logTimer = setTimeout(flushLog, 500)
  listeners.forEach(listener => listener())
}
export const clearLog = () => { logCache = []; flushLog(); listeners.forEach(listener => listener()) }
export const subscribeLog = listener => {
  listeners.push(listener)
  return () => { const i = listeners.indexOf(listener); if (i !== -1) listeners.splice(i, 1) }
}

// Record the player's explicit branch selection. This is a history of choices, not a simulation of the original VN's
// hidden affection/route flags; the source reader still follows its currently supported graph logic.
export const recordChoice = (from, to, label) => {
  const choices = load(CHOICES_KEY, []) || []
  choices.push({from, to, label: label || "", ts: Date.now()})
  save(CHOICES_KEY, choices.slice(-500))
}
export const getChoices = () => load(CHOICES_KEY, []) || []

const readCookie = name => {
  if (typeof document === "undefined") return ""
  const match = new RegExp("(?:^|; )" + name + "=([^;]*)").exec(document.cookie)
  return match ? match[1] : ""
}
const getSettings = () => SETTINGS_COOKIE_KEYS.reduce((out, key) => {
  const value = readCookie(key)
  if (value !== "") { try { out[key] = decodeURIComponent(value) } catch (e) { out[key] = value } }
  return out
}, {})
const applySettings = settings => {
  if (!settings || typeof settings !== "object") return
  const expires = ";SameSite=Strict;path=/;max-age=315360000"
  SETTINGS_COOKIE_KEYS.forEach(key => {
    if (Object.prototype.hasOwnProperty.call(settings, key)) {
      document.cookie = key + "=" + encodeURIComponent(String(settings[key])) + expires
    }
  })
}

export const getProgressSnapshot = () => ({
  app: "fate-stay-night-web-reader",
  version: SAVE_VERSION,
  exportedAt: new Date().toISOString(),
  resume: load(RESUME_KEY, null),
  currentScene: getCurrentScene(),
  read: readSet(),
  backlog: log(),
  choices: getChoices(),
  settings: getSettings(),
  gameFlags: getGameFlags(),
  playtimeMs: getPlaytime(),
})
export const validateProgressSnapshot = data => !!(
  data && data.app === "fate-stay-night-web-reader" && (data.version === 1 || data.version === SAVE_VERSION) &&
  (data.resume === null || data.resume === undefined || (typeof data.resume.id === "string")) &&
  data.read && typeof data.read === "object" && !Array.isArray(data.read) &&
  Array.isArray(data.backlog) && Array.isArray(data.choices) && data.settings && typeof data.settings === "object" &&
  (data.gameFlags === undefined || (data.gameFlags && typeof data.gameFlags === "object" && !Array.isArray(data.gameFlags))) &&
  (data.playtimeMs === undefined || (typeof data.playtimeMs === "number" && isFinite(data.playtimeMs) && data.playtimeMs >= 0))
)
export const importProgressSnapshot = data => {
  if (!validateProgressSnapshot(data)) throw new Error("This save file is invalid or uses an unsupported version.")
  // Keep one local rollback snapshot before replacing the current browser progress.
  save(BACKUP_KEY, getProgressSnapshot())
  const ok = save(RESUME_KEY, data.resume || null) && save(READ_KEY, data.read) &&
    save(LOG_KEY, data.backlog.slice(-LOG_MAX)) && save(CHOICES_KEY, data.choices.slice(-500))
  if (!ok) throw new Error("There is not enough browser storage to import this save.")
  save(PLAYTIME_KEY, Number(data.playtimeMs) || 0)
  if (playtimeStartedAt !== null) playtimeStartedAt = Date.now()
  readCache = data.read
  if (data.currentScene) setCurrentScene(data.currentScene)
  logCache = data.backlog.slice(-LOG_MAX)
  applySettings(data.settings)
  replaceGameFlags(data.gameFlags || {})
  return true
}

export const saveSlot = slot => {
  const slots = load(SLOTS_KEY, {}) || {}
  slots[String(slot)] = getProgressSnapshot()
  return save(SLOTS_KEY, slots)
}
export const getSlots = () => load(SLOTS_KEY, {}) || {}
export const loadSlot = slot => {
  const data = getSlots()[String(slot)]
  if (!data) return false
  importProgressSnapshot(data)
  return true
}
export const clearSlot = slot => {
  const slots = getSlots()
  delete slots[String(slot)]
  save(SLOTS_KEY, slots)
}

export const getProgressSummary = () => {
  const all = Object.keys(graphLogic)
  const read = readSet()
  const routes = ["fate", "ubw", "hf"].map(route => {
    const ids = all.filter(id => route === "ubw" ? id[0] === "凛" : route === "hf" ? id[0] === "桜" : id[0] !== "凛" && id[0] !== "桜")
    const visited = ids.filter(id => !!read[id]).length
    return {route, visited, total: ids.length, unlocked: visited > 0, percent: ids.length ? Math.round(visited / ids.length * 100) : 0}
  })
  const gameFlags = getGameFlags()
  const affection = [
    {label: "Saber", key: "セイバー好感度"},
    {label: "Rin", key: "凛好感度"},
    {label: "Sakura", key: "桜好感度"},
    {label: "Illya", key: "イリヤ好感度"},
  ].filter(item => Object.prototype.hasOwnProperty.call(gameFlags, item.key)).map(item => ({...item, value: Number(gameFlags[item.key]) || 0}))
  const endings = [
    {label: "Fate / Saber", key: "gセイバークリア"},
    {label: "Unlimited Blade Works", key: "g凛クリア"},
    {label: "Rin Good", key: "g凛グッド"},
    {label: "Rin True", key: "g凛トゥルー"},
    {label: "Heaven's Feel", key: "g桜クリア"},
    {label: "Sakura True", key: "g桜トゥルー"},
    {label: "Sakura Normal", key: "g桜ノーマル"},
  ].filter(item => Number(gameFlags[item.key]) > 0).map(item => item.label)
  return {scenesVisited: Object.keys(read).filter(id => read[id]).length, routes, lastPlayed: getResume(), currentScene: getCurrentScene(), gameFlags, affection, endings}
}
