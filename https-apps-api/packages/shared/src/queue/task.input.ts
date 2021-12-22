import { EmailSendInput } from '../domain/email/email.config'
import { UserCtx } from '../types'
import { TASKS } from './task.enum'

type Task<T> = {
  type: TASKS
  payload: T
  user: UserCtx
}

// will be used in the sub-handler
type BasicUserJob = Task<null>
type CheckStatusJob = Task<{ dxid: string }>
type SendEmailJob = Task<EmailSendInput>
type CheckStaleJobsJob = Omit<Task<null>, 'user'>
type SyncDbClusterJob = Task<{ dxid: string }>

export { Task, BasicUserJob, CheckStatusJob, SendEmailJob, CheckStaleJobsJob, SyncDbClusterJob }
