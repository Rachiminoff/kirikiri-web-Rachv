import {sections} from "../../resources/generated/scene-index"

// The scene list used to lay all three routes side by side and slide between them.  Now it shows one route at a
// time, as one column: the days every route shares, then the days of the chosen route.
//
//   routeNum 0 = Fate, 1 = UBW, 2 = HF
//
// Where the graph forks into columns, the chosen route's column is taken (Fate and HF share the Fate version of
// day 3; UBW has its own).
const flatten = (node, routeNum, out) => {
  if (node.section) {
    out.push(node)
  } else if (node.h) {
    const index = node.h.length === 2 ? (routeNum === 1 ? 1 : 0) : Math.min(routeNum, node.h.length - 1)
    flatten(node.h[index], routeNum, out)
  } else if (node.v) {
    node.v.forEach(child => flatten(child, routeNum, out))
  }
}

const cache = {}

// the day panels for a route, in reading order: [{section: "セ1", v: [...]}, ...]
export const daysForRoute = routeNum => {
  if (!cache[routeNum]) {
    const out = []
    flatten(sections, routeNum, out)
    cache[routeNum] = out
  }
  return cache[routeNum]
}
