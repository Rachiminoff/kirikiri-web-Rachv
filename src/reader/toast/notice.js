// Remembers which scene the reader was in, so the next one can announce itself.
// Opening the scene list forgets it: a scene entered from the list is not a "change".
let last = null

export const enterScene = id => {
  const previous = last
  last = id
  return previous
}

export const leaveReader = () => {
  last = null
}

// Auto / Skip stay on when a scene hands over to the next one by itself (the reader is rebuilt for each scene)
let carried = {auto: false, skip: false}

export const carryModes = modes => {
  carried = {auto: !!modes.auto, skip: !!modes.skip}
}

// (read in a constructor and cleared on mount, so React's double construction in development doesn't lose them)
export const peekModes = () => carried

export const clearModes = () => {
  carried = {auto: false, skip: false}
}
