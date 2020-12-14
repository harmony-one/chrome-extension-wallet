const initialState = {
  isLocked: false,
  sender: null
}

let state = initialState

export const lock = sender => {
  if (!sender) {
    throw new Error('cannot set lock ' + JSON.stringify(sender))
  }

  if (isLocked(sender)) {
    throw new Error('already locked ' + JSON.stringify(sender))
  }

  state = {isLocked: true, sender}
}

export const unlock = () => {
  state = initialState
}


export const isLocked = sender => {
  if (!sender) {
    return state.isLocked
  }
  if (!state.sender) {
    return false
  }

  return state.sender.tab.id !== sender.tab.id
}