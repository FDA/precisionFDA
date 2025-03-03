import { ServerScope } from '../home/types'
import { NoteScope } from './api'

export type SimpleUser = {
  id: number
  dxuser: string
  firstName: string
  lastName: string
  fullName: string
}

export interface Comment {
  id: number
  discussion: number
  user: SimpleUser
  body: string
  commentableId: number
  commentableType: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface Answer {
  id: number
  discussionId: number
  title: string
  content: string
  noteId: number
  user: SimpleUser
  comments: Comment[]
  createdAt: string
  updatedAt: string
}

export interface Discussion {
  id: number
  title: string
  content: string
  scope: NoteScope
  noteId: number
  following: boolean
  user: SimpleUser
  createdAt: string
  updatedAt: string
  answers: Answer[]
  comments: Comment[]
  commentsCount: number
  answersCount: number
}

export type AttachmentType = 'UserFile' | 'Folder' | 'Asset' | 'Job' | 'App' | 'Comparison'
export type AttachmentKey = 'files' | 'folders' | 'apps' | 'comparisons' | 'assets' | 'jobs'
export type CardType = 'comment' | 'answer' | 'discussion'

export interface Attachment {
  id: number
  name: string
  type: AttachmentType
  scope: ServerScope
  link: string
}

export type FormAttachments = Record<AttachmentKey, Attachment[]>

export type NoteForm = {
  attachments: FormAttachments
  content: string
  isAnswer: boolean
  notify: { label: string; value: string }[] | []
}

export type PostAttachments = {
  files: number[]
  folders: number[]
  apps: number[]
  comparisons: number[]
  assets: number[]
  jobs: number[]
}

export interface DiscussionForm {
  title: string
  content: string
  attachments: FormAttachments
  notify: { label: string; value: string }[] | []
}

export interface CommentForm {
  content: string
  attachments: FormAttachments
}
