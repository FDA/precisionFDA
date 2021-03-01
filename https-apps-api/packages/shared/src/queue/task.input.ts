import { AnyObject, UserCtx } from '../types'
import { TASKS } from './task.enum'

type Task = {
  type: TASKS
  payload: AnyObject
  user: UserCtx
}

// will be used in the sub-handler
type CheckStatusJob = Task & {
  payload: {
    dxid: string
  }
}

export { Task, CheckStatusJob }
