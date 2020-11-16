import { App } from './app/app.entity'
import { Job } from './job/job.entity'
import { User } from './user/user.entity'
import { Tag } from './tag/tag.entity'
import { Tagging } from './tagging/tagging.entity'

const entities = { App, Job, User, Tag, Tagging }

export * as app from './app'

export * as job from './job'

export * as user from './user'

export * as tag from './tag'

export * as tagging from './tagging'

export { entities, Job, App, User }
