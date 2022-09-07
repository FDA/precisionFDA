import { App } from './app/app.entity'
import { Comment } from './comment/comment.entity'
import { DbCluster } from './db-cluster/db-cluster.entity'
import { Expert } from './expert/expert.entity'
import { ExpertQuestion } from './expert-question/expert-question.entity'
import { ExpertAnswer } from './expert-answer/expert-answer.entity'
import { Job } from './job/job.entity'
import { User } from './user/user.entity'
import { Tag } from './tag/tag.entity'
import { Tagging } from './tagging/tagging.entity'
import { Node } from './user-file/node.entity'
import { Folder } from './user-file/folder.entity'
import { UserFile } from './user-file/user-file.entity'
import { Event } from './event/event.entity'
import { Organization } from './org/org.entity'
import { EmailNotification } from './email/email-notification.entity'
import { SpaceEvent } from './space-event/space-event.entity'
import { Space } from './space/space.entity'
import { SpaceMembership } from './space-membership/space-membership.entity'
import { Asset } from './user-file/asset.entity'
import { Challenge } from './challenge/challenge.entity'
import { AdminGroup } from './admin-group/admin-group.entity'
import { AdminMembership } from './admin-membership/admin-membership.entity'

const entities = {
  AdminGroup,
  AdminMembership,
  App,
  Asset,
  Challenge,
  Comment,
  DbCluster,
  EmailNotification,
  Expert,
  ExpertAnswer,
  ExpertQuestion,
  Folder,
  Job,
  Event,
  Node,
  Organization,
  Space,
  SpaceEvent,
  SpaceMembership,
  Tag,
  Tagging,
  User,
  UserFile,
}

export * as adminGroup from './admin-group'

export * as app from './app'

export * as job from './job'

export * as user from './user'

export * as tag from './tag'

export * as tagging from './tagging'

export * as userFile from './user-file'

export * as event from './event'

export * as org from './org'

export * as email from './email'

export * as comment from './comment'

export * as dbCluster from './db-cluster'

export * as space from './space'

export {
  entities,
  AdminGroup,
  AdminMembership,
  App,
  Asset,
  Challenge,
  Comment,
  DbCluster,
  Expert,
  ExpertAnswer,
  ExpertQuestion,
  Folder,
  Job,
  Node,
  Organization,
  Space,
  SpaceEvent,
  SpaceMembership,
  Tag,
  Tagging,
  User,
  UserFile,
}
