import { App } from './app/app.entity'
import { Job } from './job/job.entity'
import { User } from './user/user.entity'
import { Tag } from './tag/tag.entity'
import { Tagging } from './tagging/tagging.entity'
import { Node } from './user-file/node.entity'
import { Folder } from './user-file/folder.entity'
import { UserFile } from './user-file/user-file.entity'
import { JobClosedEvent } from './event/job-closed.entity'
import { Organization } from './org/org.entity'

const entities = {
  App,
  Job,
  User,
  Tag,
  Tagging,
  Node,
  Folder,
  UserFile,
  JobClosedEvent,
  Organization,
}

export * as app from './app'

export * as job from './job'

export * as user from './user'

export * as tag from './tag'

export * as tagging from './tagging'

export * as userFile from './user-file'

export * as event from './event'

export * as org from './org'

export { entities, Job, App, User, UserFile, Folder, Tag, Tagging, Organization }
