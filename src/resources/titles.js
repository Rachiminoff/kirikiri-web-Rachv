import {sections} from "./generated/scene-index"

// scene id -> {eng, jp}, collected once from the scene list
const titles = {}
const collect = node => {
  if (node.id) {
    titles[node.id] = {eng: node.eng, jp: node.jp}
  }
  ;(node.v || []).concat(node.h || []).forEach(collect)
}
collect(sections)

export const SceneTitle = (id, lang) => {
  const t = titles[id]
  return (t && (t[lang] || t.eng)) || ""
}

// which route's scene list a scene belongs to: "fate" | "ubw" | "hf"
export const RouteOfScene = id => ({"凛": "ubw", "桜": "hf"}[(id || "")[0]] || "fate")

// the day panel a scene sits in: "セ8-3" -> "セ8"
export const SectionOfScene = id => ((id || "").split("-")[0])
