import { EntityScope } from '../../types/common'
import { CommentableType } from '../comment/comment.entity'
import { NoteType } from '../note/note.entity'
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

// this should be unified somewhere in the api root types.
class UserDTO {
  id: number
  dxuser: string
  firstName: string
  lastName: string
  fullName: string
}

class NoteDTO {
  id: number
  title: string
  content: string
  noteType: NoteType
  scope: EntityScope
  user: UserDTO
  createdAt: Date
  updatedAt: Date
}

class AnswerDTO {
  id: number
  discussion: number
  note: NoteDTO
  user: UserDTO
  comments: CommentDTO[]
  createdAt: Date
  updatedAt: Date
}

class CommentDTO {
  id: number
  commentableId: number
  commentableType: CommentableType
  body: string
  user: UserDTO
  createdAt: Date
  updatedAt: Date
}

class DiscussionDTO {
  id: number
  note: NoteDTO
  user: UserDTO
  answers: AnswerDTO[]
  answersCount: number
  comments: CommentDTO[]
  commentsCount: number
  createdAt: Date
  updatedAt: Date
}

export {
  AnswerDTO,
  CommentDTO,
  DiscussionAttachment,
  DiscussionDTO,
  NoteDTO,
  PublishAnswerInput,
  PublishDiscussionInput,
  UserDTO,
  Attachments,
}
