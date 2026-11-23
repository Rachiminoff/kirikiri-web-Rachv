import React, {Component} from "react"
import {LocateBGM, LocateImage} from "../../resources/lookup"
import {withOptions} from "../debug"
import {withScroll} from "../scroll/watcher"
import "./animation.css"
import AudioPlayer from "./audio/audio-player"
import Layer from "./layer/layer"


class Animation extends Component {
  constructor(props) {
    super(props)

    this.state = {animation: [], animationID: 0, bgmTimeline: [], seTimeline: []}
    this.prepareToken = 0
  }

  componentDidMount() {
    this.prepareAnimation()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.animation.id !== this.props.animation.id) {
      this.abort(false)
      this.prepareAnimation()
    }
  }

  componentWillUnmount() {
    this.prepareToken++ // anything still loading must not touch the (now gone) component
    if (this.abort) {
      this.abort(false)
    }
  }

  // `animation` is the section being loaded; it is passed in (rather than read from this.props) so that a load which
  // finishes after the reader has moved on cannot pick up the *next* section's timeline by mistake
  async preload(abortPromise, animation) {
    const promises = []
    // wait for images to load
    // neededImg *must* be held to avoid accidentally canceling the load operation
    let neededImg = Object.keys(animation.timeline || []).reduce((images, layerID) => (
      animation.timeline[layerID].reduce((images, frame) => {
        if (frame.contents.image) {
          const name = frame.contents.image
          if (!images[name]) {
            const img = new Image()
            promises.push(new Promise(resolve => {
              img.onload = () => resolve(true)
              img.onerror = () => resolve(true)
            }))
            img.src = LocateImage(name, this.props.options.lang, this.props.options.mature, this.props.options.h, this.props.options.hArtist)
            images[name] = img
          }
        }
        return images
      }, images)), {})

    const loadSound = (file) => {
      if (!file) {
        return
      }
      const audio = new Audio()
      audio.preload = "none"
      audio.innerHTML =
        "<source src=\"" + file + ".ogg\" type=\"audio/ogg\"/>" +
        "<source src=\"" + file + ".m4a\" type=\"audio/mp4\"/>"
      promises.push(new Promise(resolve => {
        audio.oncanplaythrough = () => resolve(true)
        audio.onerror = () => resolve(true)
        audio.firstElementChild.oncanplaythrough = () => resolve(true)
        audio.lastElementChild.oncanplaythrough = () => resolve(true)
        let first = true
        audio.firstElementChild.onerror = () => first ? (first = false) : resolve(true)
        audio.lastElementChild.onerror = () => first ? (first = false) : resolve(true)
      }))
      audio.preload = "auto"
      audio.load()
      return audio
    }

    // wait for music to load
    // neededBgm *must* be held to avoid accidentally canceling the load operation
    let neededBgm = (animation.bgmTimeline || []).reduce((sounds, keyframe) => {
      if (keyframe.bgm && !sounds[keyframe.bgm]) {
        const audio = loadSound(LocateBGM(keyframe.bgm, this.props.options.bgmVersion))
        if (audio) {
          sounds[keyframe.bgm] = audio
        }
      }
      return sounds
    }, {})

    // wait for sound effects to load
    // neededSe *must* be held to avoid accidentally canceling the load operation
    let neededSe = (animation.seTimeline || []).reduce((sounds, keyframe) => (
      Object.keys(keyframe.sounds).reduce((sounds, sound) => {
        if (!sounds[sound]) {
          const audio = loadSound("/static/" + sound)
          if (audio) {
            sounds[sound] = audio
          }
        }
        return sounds
      }, sounds)
    ), {})

    const continueRet = await Promise.race([abortPromise, Promise.all(promises)])
    if (!continueRet) {
      // abort loading
      Object.keys(neededImg).forEach(key => {
        neededImg[key].src = ""
        delete neededImg[key]
      })
      neededImg = undefined
      Object.keys(neededBgm).forEach(key => {
        neededBgm[key].src = ""
        delete neededBgm[key]
      })
      neededBgm = undefined
      Object.keys(neededSe).forEach(key => {
        neededSe[key].src = ""
        delete neededSe[key]
      })
      neededSe = undefined
    } else {
      // save resolution of each image
      Object.keys(animation.timeline || []).forEach(layerID => {
        const layer = animation.timeline[layerID]
        layer.forEach(frame => {
          if (frame.contents.image) {
            frame.contents.naturalWidth = neededImg[frame.contents.image].naturalWidth / 8
          }
        })
      })
    }
    return continueRet
  }

  async prepareAnimation() {
    const abortPromise = new Promise(resolve => {
      this.abort = resolve
    })

    const animation = this.props.animation
    const token = ++this.prepareToken

    if (!await this.preload(abortPromise, animation) || token !== this.prepareToken) {
      return
    }

    this.setState({
      animationID: animation.id,
      animation: animation.timeline,
      bgmTimeline: animation.bgmTimeline,
      seTimeline: animation.seTimeline,
    }, () => {
      // let the reader know this section's assets are loaded and its animation has started
      if (animation.onAnimationReady) {
        animation.onAnimationReady(animation.id)
      }
    })
  }

  render() {
    const positions = ["large-background-holder-left background-blur", "large-background-holder-right background-blur", "large-background-holder-bottom background-blur", "background-holder"]

    return <>
      {positions.map(position => (
        <div key={position} className={position}>
          <div className="background-margin-hack">
            <div className="background-image-holder">
              {this.state.animationID !== 0 && Object.keys(this.state.animation).map(layerID => {
                const layer = this.state.animation[layerID]
                return <Layer key={this.props.freezeFrame + layerID}
                              layer={layerID}
                              animationID={this.state.animationID}
                              animation={this.props.freezeFrame && layer.length !== 0 ? [layer[0]] : layer}/>
              })}
            </div>
          </div>
        </div>
      ))}
      {!this.props.freezeFrame &&
      <AudioPlayer animationID={this.state.animationID}
                   bgmTimeline={this.state.bgmTimeline || []}
                   seTimeline={this.state.seTimeline || []}/>}
    </>
  }
}

Animation = withOptions(withScroll(Animation))
export default Animation
