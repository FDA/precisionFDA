import { EntityScope } from '../../types/common'
import { NotifyType } from '@shared/domain/discussion/dto/notify.type'

type PublishDiscussionInput = {
  id: number
  scope: EntityScope
  toPublish: Attachments
  notify: NotifyType
}

type PublishAnswerInput = PublishDiscussionInput & {
  discussionId: number
}

type Attachments = {
  files?: number[]
  folders?: number[]
  assets?: number[]
  apps?: number[]
  jobs?: number[]
  comparisons?: number[]
}

type DiscussionAttachment = {
  id: number
  uid: string
  type: 'App' | 'UserFile' | 'Folder' | 'Asset' | 'Job' | 'Comparison'
  name: string
  link: string
}

export { DiscussionAttachment, PublishAnswerInput, PublishDiscussionInput, Attachments }
