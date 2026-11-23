import React, {useMemo} from "react"
import {withRouter} from "react-router"
import {LocateImage} from "../../resources/lookup"
import "./background.css"

let Background = props => {
  let route
  switch (props.match.params.route) {
    case "ubw":
    case "rin":
    case "凛":
      route = "ubw"
      break
    case "hf":
    case "sakura":
    case "桜":
      route = "hf"
      break
    default:
      route = "fate"
  }

  const logoRoute = useMemo(() => {
    // On the landing page, rotate the title mark between the three route identities.
    // A route-specific URL keeps its matching logo.
    if (props.match.params.route) return route
    const choices = ["fate", "ubw", "hf"]
    return choices[Math.floor(Math.random() * choices.length)]
  }, [props.match.params.route])

  return <>
    <div className="home-background replaceable-image">
      <img src={LocateImage("ta_back_fate")} visible={route === "fate" ? "" : undefined} alt=""/>
      <img src={LocateImage("ta_back_ubw")} visible={route === "ubw" ? "" : undefined} alt=""/>
      <img src={LocateImage("ta_back_hf")} visible={route === "hf" ? "" : undefined} alt=""/>

      {/*<img src={"/static/images/" + "tb_back_fate" + ".webp"} visible={route === "fate" ? "" : undefined} alt=""/>*/}
      {/*<img src={"/static/images/" + "tb_back_norealta" + ".webp"} visible={route === "ubw" ? "" : undefined} alt=""/>*/}
      {/*<img src={"/static/images/" + "tb_back_hf" + ".webp"} visible={route === "hf" ? "" : undefined} alt=""/>*/}
    </div>

    <div className="top-section">
      <div className="title-image replaceable-image">
        <img src={LocateImage("ta_logo6_fate")} visible={logoRoute === "fate" ? "" : undefined} alt="Fate route logo"/>
        <img src={LocateImage("ta_logo6_ubw")} visible={logoRoute === "ubw" ? "" : undefined} alt="Unlimited Blade Works route logo"/>
        <img src={LocateImage("ta_logo6_hf")} visible={logoRoute === "hf" ? "" : undefined} alt="Heaven's Feel route logo"/>

        {/*<img src={"/static/images/" + "tb_logo6_fate" + ".webp"} visible={route === "fate" ? "" : undefined} alt=""/>*/}
        {/*<img src={"/static/images/" + "tb_logo6_ubw" + ".webp"} visible={route === "ubw" ? "" : undefined} alt=""/>*/}
        {/*<img src={"/static/images/" + "tb_logo6_hf" + ".webp"} visible={route === "hf" ? "" : undefined} alt=""/>*/}
      </div>
    </div>
  </>
}


Background = withRouter(Background)
export default Background
