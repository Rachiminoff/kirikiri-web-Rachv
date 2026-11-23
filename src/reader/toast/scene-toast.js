import React, {useEffect, useState} from "react"
import "./scene-toast.css"

// A short notice at the top of the screen when the story moves on to another scene by itself.
const SceneToast = ({title, noticeKey}) => {
  const [visible, setVisible] = useState(!!title)

  useEffect(() => {
    setVisible(!!title)
    if (!title) {
      return undefined
    }
    const timer = setTimeout(() => setVisible(false), 4200)
    return () => clearTimeout(timer)
  }, [title, noticeKey])

  if (!title || !visible) {
    return null
  }
  return <div className="scene-toast" role="status" aria-live="polite">
    <span className="scene-toast-eyebrow">Scene change</span>
    <span className="scene-toast-title">{title}</span>
  </div>
}

export default SceneToast
