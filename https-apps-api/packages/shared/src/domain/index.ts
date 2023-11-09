import { AcceptedLicense } from './accepted-license/accepted-license.entity'
import { AdminGroup } from './admin-group/admin-group.entity'
import { AdminMembership } from './admin-membership/admin-membership.entity'
import { Answer } from './answer/answer.entity'
import { AppSeries } from './app-series'
import { App } from './app/app.entity'
import { Attachment } from './attachment/attachment.entity'
import { ChallengeResource } from './challenge/challenge-resource.entity'
import { Challenge } from './challenge/challenge.entity'
import { AnswerComment, Comment, DiscussionComment } from './comment'
import { ComparisonInput } from './comparison-input/comparison-input.entity'
import { Comparison } from './comparison/comparison.entity'
import { DataPortal } from './data-portal/data-portal.entity'
import { DbCluster } from './db-cluster/db-cluster.entity'
import { Discussion } from './discussion'
import { Event } from './event/event.entity'
import { ExpertAnswer } from './expert-answer/expert-answer.entity'
import { ExpertQuestion } from './expert-question/expert-question.entity'
import { Expert } from './expert/expert.entity'
import { Follow } from './follow/follow.entity'
import { Job } from './job/job.entity'
import { License } from './license/license.entity'
import { LicensedItem } from './licensed-item/licensed-item.entity'
import { NewsItem } from './news-item/news-item.entity'
import { Note } from './note'
import { NotificationPreference } from './notification-preference/notification-preference.entity'
import { Notification } from './notification/notification.entity'
import { Organization } from './org/org.entity'
import { Resource } from './resource/resource.entity'
import { Session } from './session'
import { SpaceEvent } from './space-event/space-event.entity'
import { SpaceMembership } from './space-membership/space-membership.entity'
import { SpaceReport, SpaceReportPart } from './space-report'
import { Space } from './space/space.entity'
import { Tag } from './tag/tag.entity'
import { Tagging } from './tagging/tagging.entity'
import { Asset } from './user-file/asset.entity'
import { Folder } from './user-file/folder.entity'
import { Node } from './user-file/node.entity'
import { UserFile } from './user-file/user-file.entity'
import { User } from './user/user.entity'
import { Vote } from './vote/vote.entity'
import { Workflow } from './workflow/entity/workflow.entity'

const entities = {
  AcceptedLicense,
  AdminGroup,
  AdminMembership,
  App,
  Attachment,
  AppSeries,
  DataPortal,
  Workflow,
  Asset,
  Answer,
  Challenge,
  ChallengeResource,
  Comment,
  AnswerComment,
  DiscussionComment,
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
  Note,
  Job,
  License,
  LicensedItem,
  NewsItem,
  Node,
  Discussion,
  Organization,
  Space,
  SpaceEvent,
  SpaceMembership,
  SpaceReport,
  SpaceReportPart,
  Resource,
  Tag,
  Tagging,
  User,
  UserFile,
  Session,
  Follow,
  Vote,
}

export * as acceptedLicense from './accepted-license'
export * as adminGroup from './admin-group'
export * as spaceEvent from './space-event'
export * as app from './app'
export * as attachment from './attachment'
export * as answer from './answer'
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
export * as dataPortal from './data-portal'
export * as discussion from './discussion'
export * as note from './note'
export * as resource from './resource'
export * as follow from './follow'
export * as vote from './vote'
export * as spaceReport from './space-report'
export * as provenance from './provenance'
export * as platform from './platform'
export * as entity from './entity'

export {
  entities,
  AcceptedLicense,
  AdminGroup,
  AdminMembership,
  App,
  Answer,
  Attachment,
  AppSeries,
  DataPortal,
  Workflow,
  Asset,
  Challenge,
  ChallengeResource,
  Comment,
  Comparison,
  ComparisonInput,
  DbCluster,
  Discussion,
  Event,
  Expert,
  ExpertAnswer,
  ExpertQuestion,
  Notification,
  Note,
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
  SpaceReport,
  SpaceReportPart,
  Resource,
  Tag,
  Tagging,
  User,
  UserFile,
  Session,
  Follow,
  Vote,
}
