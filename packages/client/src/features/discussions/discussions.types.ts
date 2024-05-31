import { IUser } from '../../types/user'
import { ServerScope } from '../home/types'
import { NoteScope } from './api'

export interface Note {
  content: string
  id: number
  noteType: 'Answer' | 'Discussion'
  scope: NoteScope
  title: string
  user: IUser
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: number
  discussion: number
  user: IUser
  body: string
  commentableId: number
  commentableType: string
  title: string
  createdAt: string
  updatedAt: string
}
export interface Answer {
  id: number
  note: Note
  discussion: number
  user: IUser
  comments: Comment[]
  createdAt: string
  updatedAt: string
}

export interface Discussion {
  id: number
  note: Note
  user: IUser
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
  notifyAll: boolean
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
  notifyAll: boolean
}

export interface CommentForm {
  content: string
  attachments: FormAttachments
}
