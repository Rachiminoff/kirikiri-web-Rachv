import {evaluateCondition, applySceneUpdates, getGameFlags, replaceGameFlags} from "./game-state"

describe("route progression flags", () => {
  beforeEach(() => replaceGameFlags({}))
  test("evaluates numeric comparisons and combined Japanese flag conditions", () => {
    expect(evaluateCondition("桜好感度>=1&&桜ルート分岐>=1", {桜好感度: 2, 桜ルート分岐: 1})).toBe(true)
    expect(evaluateCondition("凛好感度<=2||ギアス==1", {凛好感度: 3, ギアス: 1})).toBe(true)
    expect(evaluateCondition("道場説明!=1", {道場説明: 0})).toBe(true)
  })
  test("applies generated scene updates as increments and assignments", () => {
    applySceneUpdates("セ1-1")
    expect(getGameFlags()["桜好感度"]).toBe(1)
    applySceneUpdates("セ1-1")
    expect(getGameFlags()["桜好感度"]).toBe(2)
    applySceneUpdates("セ1-2")
    expect(getGameFlags()["道場説明"]).toBe(1)
  })
})
