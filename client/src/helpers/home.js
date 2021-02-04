import * as C from '../constants'
import { getQueryParam } from '../utils'


const getSelectedTab = (location, space) => {
  if (space) return C.HOME_TABS.SPACES

  switch (location) {
    case 'Private':
      return C.HOME_TABS.PRIVATE
    case 'Public':
      return C.HOME_TABS.EVERYBODY
    case 'Featured':
      return C.HOME_TABS.FEATURED
    default:
      return null
  }
}

const getWorkflowState = (states) => {
  const runnableList = ['runnable', 'idle', 'done']
  const waitingOnInputList = runnableList.concat(['waiting_on_input'])
  const runningList = waitingOnInputList.concat(['running'])

  const stateRunnable = (states) => {
    return states.every(e => runnableList.indexOf(e) !== -1)
  }
  const stateWaitingOnInput = (states) => {
    return states.every(e => waitingOnInputList.indexOf(e) !== -1)
  }
  const stateRunning = (states) => {
    return states.every(e => runningList.indexOf(e) !== -1)
  }

  if (states.every(e => e === 'done')) return 'done'
  if (states.some(e => e === 'failed')) return 'failed'
  if (states.includes('terminating')) return 'terminating'
  if (states.includes('terminated')) return 'terminated'
  if (states.every(e => e === 'idle')) return 'idle'
  if (stateRunnable(states)) return 'runnable'
  if (stateWaitingOnInput(states)) return 'waiting on input'
  if (stateRunning(states)) return 'running'

  return ''
}

const getFolderId = (location) => {
  const folderId = location && getQueryParam(location.search, 'folderId')
  return folderId ? parseInt(folderId) : folderId
}

export { getSelectedTab, getWorkflowState, getFolderId }
