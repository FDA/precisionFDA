import { App } from './app/app.entity'
import { AppSeries } from './app-series'
import { Workflow } from './workflow/workflow.entity'
import { Comment } from './comment/comment.entity'
import { DbCluster } from './db-cluster/db-cluster.entity'
import { Expert } from './expert/expert.entity'
import { ExpertQuestion } from './expert-question/expert-question.entity'
import { ExpertAnswer } from './expert-answer/expert-answer.entity'
import { Job } from './job/job.entity'
import { AcceptedLicense } from './accepted-license/accepted-license.entity'
import { LicensedItem } from './licensed-item/licensed-item.entity'
import { License } from './license/license.entity'
import { User } from './user/user.entity'
import { Tag } from './tag/tag.entity'
import { Tagging } from './tagging/tagging.entity'
import { Node } from './user-file/node.entity'
import { Notification } from './notification/notification.entity'
import { Folder } from './user-file/folder.entity'
import { UserFile } from './user-file/user-file.entity'
import { Event } from './event/event.entity'
import { Organization } from './org/org.entity'
import { SpaceEvent } from './space-event/space-event.entity'
import { Space } from './space/space.entity'
import { SpaceMembership } from './space-membership/space-membership.entity'
import { Asset } from './user-file/asset.entity'
import { Challenge } from './challenge/challenge.entity'
import { AdminGroup } from './admin-group/admin-group.entity'
import { AdminMembership } from './admin-membership/admin-membership.entity'
import { ChallengeResource } from './challenge/challenge-resource.entity'
import { Comparison } from './comparison/comparison.entity'
import { NewsItem } from './news-item/news-item.entity'
import { ComparisonInput } from './comparison-input/comparison-input.entity'
import { NotificationPreference } from './notification-preference/notification-preference.entity'
import { Session } from './session'

const entities = {
  AcceptedLicense,
  AdminGroup,
  AdminMembership,
  App,
  AppSeries,
  Workflow,
  Asset,
  Challenge,
  ChallengeResource,
  Comment,
  Comparison,
  ComparisonInput,
  DbCluster,
  Event,
  Expert,
  ExpertAnswer,
  ExpertQuestion,
  Notification,
  NotificationPreference,
  Folder,
  Job,
  License,
  LicensedItem,
  NewsItem,
  Node,
  Organization,
  Space,
  SpaceEvent,
  SpaceMembership,
  Tag,
  Tagging,
  User,
  UserFile,
  Session,
}

export * as acceptedLicense from './accepted-license'

export * as adminGroup from './admin-group'

export * as spaceEvent from './space-event'

export * as app from './app'

export * as workflow from './workflow'

export * as job from './job'

export * as license from './license'

export * as notification from './notification'

export * as user from './user'

export * as tag from './tag'

export * as tagging from './tagging'

export * as userFile from './user-file'

export * as event from './event'

export * as org from './org'

export * as email from './email'

export * as newsItem from './news-item'

export * as comment from './comment'

export * as dbCluster from './db-cluster'

export * as space from './space'

export * as spaceMembership from './space-membership'

export * as challenge from './challenge'


export {
  entities,
  AcceptedLicense,
  AdminGroup,
  AdminMembership,
  App,
  AppSeries,
  Workflow,
  Asset,
  Challenge,
  ChallengeResource,
  Comment,
  Comparison,
  ComparisonInput,
  DbCluster,
  Event,
  Expert,
  ExpertAnswer,
  ExpertQuestion,
  Notification,
  NotificationPreference,
  Folder,
  Job,
  License,
  LicensedItem,
  NewsItem,
  Node,
  Organization,
  Space,
  SpaceEvent,
  SpaceMembership,
  Tag,
  Tagging,
  User,
  UserFile,
  Session,
}
