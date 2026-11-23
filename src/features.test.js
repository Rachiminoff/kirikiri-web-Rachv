import React from "react"
import {render, fireEvent} from "@testing-library/react"
import {MemoryRouter, Route} from "react-router-dom"
import Options from "./options/options"
import Home from "./home/home"
import {NextOf} from "./reader/next"
import {daysForRoute} from "./home/graph/route"
import {pushLog, getLog, saveResume, getResume, getProgressSnapshot, validateProgressSnapshot, importProgressSnapshot, recordChoice, getChoices} from "./progress/progress"
import {replaceGameFlags} from "./progress/game-state"

test("next resolution", () => {
  replaceGameFlags({})
  expect(NextOf("セ1-6", 0)).toEqual({goto: "セ1-3"})
  expect(NextOf("セ1-15", 0)).toEqual({goto: "セ2-0"})
  expect(NextOf("セ11-19", 0)).toEqual({goto: "セ11-18"})
  expect(NextOf("セ11-19", 1)).toEqual({goto: "セ11-118"})
  expect(NextOf("セ1-0", 0).choices.length).toBe(2)
  expect(NextOf("セ10-10", 0)).toBe(null)
})

test("routes are one column each", () => {
  const ids = r => daysForRoute(r).map(d => d.section)
  expect(ids(0)).toEqual(["プ","セ1","セ2","セ3","セ4","セ5","セ6","セ7","セ9","セ10","セ11","セ12","セ13","セ14","セ15"])
  expect(ids(1).slice(0,5)).toEqual(["プ","セ1","セ2","凛3","凛4"])
  expect(ids(2).slice(0,5)).toEqual(["プ","セ1","セ2","セ3","桜4"])
})

test("store", () => {
  pushLog("セ1-1", 2, "hello"); pushLog("セ1-1", 2, "hello"); pushLog("セ1-1", 3, "bye")
  expect(getLog().length).toBe(2)
  saveResume({id: "セ8-3", hash: "", sec: 4, page: 1})
  expect(getResume().id).toBe("セ8-3")
})

test("home renders one route, resume card, dropdown", () => {
  saveResume({id: "凛5-3", hash: "", sec: 4, page: 1})
  window.HTMLElement.prototype.scrollIntoView = () => {}
  const {container, getByText, queryByText} = render(
    <MemoryRouter initialEntries={["/"]}><Options><Route exact path={["/:route(prologue|プロローグ|fate|saber|セイバ|ubw|rin|凛|hf|sakura|桜)", "/"]}><Home/></Route></Options></MemoryRouter>)
  expect(container.querySelector(".resume-card")).toBeTruthy()
  // fate route at '/', resume is UBW -> replaced to /ubw
  const days = [...container.querySelectorAll(".section-day")].map(e => e.id)
  expect(days.includes("day-凛5")).toBe(true)
  expect(days.includes("day-セ4")).toBe(false)
  fireEvent.click(container.querySelector(".route-current"))
  expect(container.querySelectorAll(".route-option").length).toBe(3)
  fireEvent.click(container.querySelectorAll(".route-option")[2])
  const days2 = [...container.querySelectorAll(".section-day")].map(e => e.id)
  expect(days2.includes("day-桜5")).toBe(true)
  expect(days2.includes("day-凛5")).toBe(false)
})


test("progress save files validate and restore reading state", () => {
  replaceGameFlags({"桜好感度": 3, "桜ルート分岐": 1})
  saveResume({id: "セ8-3", hash: "", sec: 4, page: 1})
  recordChoice("セ1-0", "セ1-1", "Choice A")
  const snapshot = getProgressSnapshot()
  expect(validateProgressSnapshot(snapshot)).toBe(true)
  expect(() => importProgressSnapshot(snapshot)).not.toThrow()
  expect(getResume().id).toBe("セ8-3")
  expect(getChoices().some(choice => choice.from === "セ1-0" && choice.to === "セ1-1")).toBe(true)
  expect(getProgressSnapshot().gameFlags["桜好感度"]).toBe(3)
  expect(validateProgressSnapshot({app: "wrong", version: 1})).toBe(false)
})
