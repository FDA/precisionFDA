import { IUser } from '../../types/user'
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
  answers: Answer[],
  comments: Comment[]
  commentsCount: number
  answersCount: number
}


export type AttachmentType = 'UserFile' | 'Asset' | 'Job' | 'App' | 'Comparison'
export type AttachmentKey = 'files' | 'apps' | 'comparisons' | 'assets' | 'jobs' 
export type CardType = 'comment' | 'answer' | 'discussion'

export interface Attachment {
  id: number
  uid: string
  name: string
  type: AttachmentType
}

export type FormAttachments = Record<AttachmentKey, Attachment[]>

export type NoteForm = {
  attachments: FormAttachments
  content: string
  isAnswer: boolean
}

export type PostAttachments = {
  files: number[],
  apps: number[],
  comparisons: number[],
  assets: number[],
  jobs: number[],
}


export interface DiscussionForm {
  title: string
  content: string
  attachments: FormAttachments
}

export interface CommentForm {
  content: string
  attachments: FormAttachments
}
