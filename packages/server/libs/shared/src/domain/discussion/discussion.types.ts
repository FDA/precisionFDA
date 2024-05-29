import { SCOPE } from '../../types/common'
import { CommentableType } from '../comment/comment.entity'
import { NoteType } from '../note/note.entity'

type BaseInput = {
  title?: string
  content?: string
  attachments?: {
    files?: number[]
    folders?: number[]
    assets?: number[]
    apps?: number[]
    jobs?: number[]
    comparisons?: number[]
  }
}

type UpdateDiscussionInput = Partial<BaseInput> & {
  id?: number
}

type PublishDiscussionInput = {
  id: number
  scope: SCOPE
  toPublish: {
    files?: number[]
    folders?: number[]
    assets?: number[]
    apps?: number[]
    jobs?: number[]
    comparisons?: number[]
  }
  notifyAll?: boolean
}

type CreateAnswerInput = BaseInput & {
  discussionId: number
}

type UpdateAnswerInput = Partial<BaseInput> & {
  answerId: number
  discussionId: number
}

type PublishAnswerInput = PublishDiscussionInput & {
  discussionId: number
}

type CreateCommentInput = {
  comment: string
  notifyAll?: boolean
  targetId: number
  targetType: CommentableType
}

type EditCommentInput = {
  id: number
  targetType: CommentableType
  comment: string
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
  scope: SCOPE
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
  BaseInput,
  CommentDTO,
  CreateAnswerInput,
  CreateCommentInput,
  DiscussionAttachment,
  DiscussionDTO,
  EditCommentInput,
  NoteDTO,
  PublishAnswerInput,
  PublishDiscussionInput,
  UpdateAnswerInput,
  UpdateDiscussionInput,
  UserDTO,
}
