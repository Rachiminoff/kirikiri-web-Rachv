import React, {useEffect} from "react"
import {withOptions} from "../reader/debug"
import {leaveReader} from "../reader/toast/notice"
import Background from "./background/background"
import Graph from "./graph/graph"
import Introduction from "./introduction/introduction"
import Resume from "./resume/resume"

let Home = (props) => {
  // a scene opened from the list is not a "scene change"
  useEffect(() => {
    leaveReader()
  }, [])

  return <>
    {props.options.tick}
    <Background/>
    <Introduction/>
    <Resume/>
    <Graph/>
  </>
}

Home = withOptions(Home)
export default Home
