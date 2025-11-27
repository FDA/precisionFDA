import { AttachableEntityType } from '@shared/domain/discussion/model/attachable-entity.type'
import { SpaceReportPartResultBase } from '@shared/domain/space-report/model/space-report-part-result-base'

export interface SpaceReportPartDiscussionResultCommentCreatedBy {
  fullName: string
  dxuser: string
}

export interface SpaceReportPartDiscussionResultAttachment {
  name: string
  link: string
  type: AttachableEntityType
}

export interface SpaceReportPartDiscussionResultComment {
  content: string
  createdBy: SpaceReportPartDiscussionResultCommentCreatedBy
  createdAt: Date
  attachments: SpaceReportPartDiscussionResultAttachment[]
}

export interface SpaceReportPartDiscussionResultAnswer
  extends SpaceReportPartDiscussionResultComment {
  comments: SpaceReportPartDiscussionResultComment[]
}

export type SpaceReportPartDiscussionResult = SpaceReportPartResultBase &
  SpaceReportPartDiscussionResultAnswer & {
    answers: SpaceReportPartDiscussionResultAnswer[]
  }
