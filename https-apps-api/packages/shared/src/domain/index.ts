import { App } from './app/app.entity'
import { Comment } from './comment/comment.entity'
import { Job } from './job/job.entity'
import { User } from './user/user.entity'
import { Tag } from './tag/tag.entity'
import { Tagging } from './tagging/tagging.entity'
import { Node } from './user-file/node.entity'
import { Folder } from './user-file/folder.entity'
import { UserFile } from './user-file/user-file.entity'
import { JobClosedEvent } from './event/job-closed.entity'
import { Organization } from './org/org.entity'
import { EmailNotification } from './email/email-notification.entity'
import { SpaceEvent } from './space-event/space-event.entity'
import { Space } from './space/space.entity'
import { SpaceMembership } from './space-membership/space-membership.entity'
import { Asset } from './user-file/asset.entity'

const entities = {
  App,
  Comment,
  Job,
  User,
  Tag,
  Tagging,
  Node,
  Folder,
  Asset,
  UserFile,
  JobClosedEvent,
  Organization,
  EmailNotification,
  SpaceEvent,
  SpaceMembership,
  Space,
}

export * as app from './app'

export * as job from './job'

export * as user from './user'

export * as tag from './tag'

export * as tagging from './tagging'

export * as userFile from './user-file'

export * as event from './event'

export * as org from './org'

<<<<<<< HEAD
export * as email from './email'

export * as comment from './comment'

export {
  entities,
  Job,
  App,
  Comment,
  User,
  UserFile,
  Folder,
  Tag,
  Tagging,
  Organization,
  Node,
  Space,
  SpaceMembership,
  SpaceEvent,
}
=======
export { entities, Job, App, User, UserFile, Folder, Tag, Tagging, Organization, Node, Asset }
>>>>>>> master
