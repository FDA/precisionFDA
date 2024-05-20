import { AcceptedLicense } from '@shared/domain/accepted-license/accepted-license.entity'
import { AdminGroup } from '@shared/domain/admin-group/admin-group.entity'
import { AdminMembership } from '@shared/domain/admin-membership/admin-membership.entity'
import { Answer } from '@shared/domain/answer/answer.entity'
import { Alert } from '@shared/domain/alert/entity/alert.entity'
import { AppSeries } from '@shared/domain/app-series/app-series.entity'
import { App } from '@shared/domain/app/app.entity'
import { Attachment } from '@shared/domain/attachment/attachment.entity'
import { ChallengeResource } from '@shared/domain/challenge/challenge-resource.entity'
import { Challenge } from '@shared/domain/challenge/challenge.entity'
import { AnswerComment } from '@shared/domain/comment/answer-comment.entity'
import { Comment } from '@shared/domain/comment/comment.entity'
import { DiscussionComment } from '@shared/domain/comment/discussion-comment.entity'
import { ComparisonInput } from '@shared/domain/comparison-input/comparison-input.entity'
import { Comparison } from '@shared/domain/comparison/comparison.entity'
import { DataPortal } from '@shared/domain/data-portal/data-portal.entity'
import { DbCluster } from '@shared/domain/db-cluster/db-cluster.entity'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { Event } from '@shared/domain/event/event.entity'
import { ExpertAnswer } from '@shared/domain/expert-answer/expert-answer.entity'
import { ExpertQuestion } from '@shared/domain/expert-question/expert-question.entity'
import { Expert } from '@shared/domain/expert/expert.entity'
import { Follow } from '@shared/domain/follow/follow.entity'
import { Job } from '@shared/domain/job/job.entity'
import { License } from '@shared/domain/license/license.entity'
import { LicensedItem } from '@shared/domain/licensed-item/licensed-item.entity'
import { NewsItem } from '@shared/domain/news-item/news-item.entity'
import { Note } from '@shared/domain/note/note.entity'
import { NotificationPreference } from '@shared/domain/notification-preference/notification-preference.entity'
import { Notification } from '@shared/domain/notification/notification.entity'
import { Organization } from '@shared/domain/org/org.entity'
import { GeneralProperty } from '@shared/domain/property/property.entity'
import { Resource } from '@shared/domain/resource/resource.entity'
import { Session } from '@shared/domain/session/session.entity'
import { SpaceEvent } from '@shared/domain/space-event/space-event.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SpaceReportPart } from '@shared/domain/space-report/entity/space-report-part.entity'
import { SpaceReport } from '@shared/domain/space-report/entity/space-report.entity'
import { Space } from '@shared/domain/space/space.entity'
import { Tag } from '@shared/domain/tag/tag.entity'
import { Tagging } from '@shared/domain/tagging/tagging.entity'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { Node } from '@shared/domain/user-file/node.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { Vote } from '@shared/domain/vote/vote.entity'
import { WorkflowSeries } from '@shared/domain/workflow-series/workflow-series.entity'
import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'

export const entities = [
  AcceptedLicense,
  AdminGroup,
  AdminMembership,
  App,
  Alert,
  Attachment,
  AppSeries,
  DataPortal,
  Workflow,
  WorkflowSeries,
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
  GeneralProperty,
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
]
