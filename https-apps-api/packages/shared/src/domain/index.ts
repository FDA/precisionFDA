import { App } from './app/app.entity'
import { Job } from './job/job.entity'
import { User } from './user/user.entity'

const entities = { App, Job, User }

export * as app from './app'

export * as job from './job'

export * as user from './user'

export { entities, Job, App, User }
