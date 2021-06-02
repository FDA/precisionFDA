import { EmailSendInput } from '../domain/email/email.config'
import { UserCtx } from '../types'
import { TASKS } from './task.enum'

type Task<T> = {
  type: TASKS
  payload: T
  user: UserCtx
}

// will be used in the sub-handler
type CheckStatusJob = Task<{ dxid: string }>
type SendEmailJob = Task<EmailSendInput>

export { Task, CheckStatusJob, SendEmailJob }
