import { EntityType } from '@shared/domain/entity/domain/entity.type'
import { SpaceReportPartResultBase } from '@shared/domain/space-report/model/space-report-part-result-base'

export interface SpaceReportPartDiscussionResultCommentCreatedBy {
  fullName: string
  dxuser: string
}

export interface SpaceReportPartDiscussionResultAttachment {
  name: string
  link: string
  type: EntityType
}

export interface SpaceReportPartDiscussionResultComment {
  content: string
  createdBy: SpaceReportPartDiscussionResultCommentCreatedBy
  createdAt: Date
}

export interface SpaceReportPartDiscussionResultAnswer
  extends SpaceReportPartDiscussionResultComment {
  comments: SpaceReportPartDiscussionResultComment[]
  attachments: SpaceReportPartDiscussionResultAttachment[]
}

export type SpaceReportPartDiscussionResult = SpaceReportPartResultBase &
  SpaceReportPartDiscussionResultAnswer & {
    answers: SpaceReportPartDiscussionResultAnswer[]
  }
