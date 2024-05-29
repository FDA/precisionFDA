import axios from 'axios'
import { Answer, Attachment, Comment, Discussion, PostAttachments } from './discussions.types'

export type BasePayload = {
  content: string
  // attachments are referred by ID
  attachments: PostAttachments
}

export type CommentPayload = BasePayload & {
  isAnswer: boolean
  notifyAll: boolean
}

export type NotePayload = BasePayload & {
  id: number
}

export type DiscussionPayload = BasePayload & {
  title: string
  notifyAll: boolean
}

export type CreateAnswerPayload = BasePayload & {
  title: string
  notifyAll: boolean
}

export type IdResponse = {
  id: number
}
export type EditDiscussionPayload = Partial<DiscussionPayload & IdResponse>

export type EditAnswerPayload = Partial<CreateAnswerPayload & IdResponse>
export type NoteScope = 'public' | `space-${number}`
export type PublishPayload = {
  id: number
  scope: NoteScope
  toPublish: {
    files: number[]
    assets: number[]
    apps: number[]
    jobs: number[]
    comparisons: number[]
  }
  notifyAll: boolean
}

type IdWithCountResponse = IdResponse & {
  count: number
}

export async function createDiscussionRequest(payload: DiscussionPayload) {
  return axios.post<IdResponse>('/api/discussions', { discussion: payload }).then(r => r.data)
}

export async function createAnswerRequest(discussionId: number, payload: CreateAnswerPayload) {
  return axios.post<IdResponse>(`/api/discussions/${discussionId}/answers`, { answer: payload }).then(r => r.data)
}

export async function createDiscussionCommentRequest(discussionId: number, payload: CommentPayload) {
  return axios.post<IdResponse>(`/api/discussions/${discussionId}/comments`, { comment: payload }).then(r => r.data)
}

export async function createAnswerCommentRequest(discussionId: number, answerId: number, payload: CommentPayload) {
  return axios
    .post<IdResponse>(`/api/discussions/${discussionId}/answers/${answerId}/comments`, { comment: payload })
    .then(r => r.data)
}

export async function editDiscussionRequest(discussionId: number, payload: EditDiscussionPayload) {
  return axios.put<IdResponse>(`/api/discussions/${discussionId}`, { discussion: payload }).then(r => r.data)
}

export async function editAnswerRequest(discussionId: number, answerId: number, payload: EditAnswerPayload) {
  return axios.put<IdResponse>(`/api/discussions/${discussionId}/answers/${answerId}`, { answer: payload }).then(r => r.data)
}

export async function editDiscussionCommentRequest(discussionId: number, commentId: number, payload: CommentPayload) {
  return axios.put<IdResponse>(`/api/discussions/${discussionId}/comments/${commentId}`, { comment: payload }).then(r => r.data)
}

export async function editAnswerCommentRequest(
  discussionId: number,
  answerId: number,
  commentId: number,
  payload: CommentPayload,
) {
  return axios
    .put<IdResponse>(`/api/discussions/${discussionId}/answers/${answerId}/comments/${commentId}`, { comment: payload })
    .then(r => r.data)
}

export async function publishDiscussionRequest(payload: PublishPayload) {
  return axios.post<IdWithCountResponse>(`/api/discussions/${payload.id}/publish`, { discussion: payload }).then(r => r.data)
}

export async function publishAnswerRequest(discussionId: number, payload: PublishPayload) {
  // todo fix route to REST API standard once ruby is finally gone.
  return axios.patch<IdWithCountResponse>(`/api/discussions/${discussionId}/answers`, { answer: payload }).then(r => r.data)
}

export async function fetchDiscussionsRequest(scope: string) {
  return axios.get(`/api/discussions?scope=${scope}`).then(r => r.data.discussions as Discussion[])
}

export async function fetchDiscussionRequest(discussionId: number) {
  return axios.get<Discussion>(`/api/discussions/${discussionId}`).then(r => r.data)
}

export async function fetchAnswerRequest(discussionId: number, answerId: number) {
  return axios.get<Answer>(`/api/discussions/${discussionId}/answers/${answerId}`).then(r => r.data)
}

export async function fetchAttachmentsRequest(noteId?: number) {
  if (!noteId) return []
  // yes this is wrong - i just want to avoid creating another ruby endpoint class for now.
  return axios.get(`/api/discussions/${noteId}/attachments`).then(r => r.data.attachments as Attachment[])
}

export async function fetchDiscussionCommentRequest(discussionId: number, commentId: number) {
  return axios.get<Comment>(`/api/discussions/${discussionId}/comments/${commentId}`).then(r => r.data)
}

export async function fetchAnswerCommentRequest(discussionId: number, answerId: number, commentId: number) {
  return axios.get<Comment>(`/api/discussions/${discussionId}/answers/${answerId}/comments/${commentId}`).then(r => r.data)
}

export async function deleteDiscussionRequest(discussionId: number) {
  return axios.delete(`/api/discussions/${discussionId}`).then(r => r.data) // no response except http code
}

export async function deleteAnswerRequest(discussionId: number, answerId: number) {
  return axios.delete(`/api/discussions/${discussionId}/answers/${answerId}`).then(r => r.data) // no response except http code
}

export async function deleteDiscussionCommentRequest(discussionId: number, commentId: number) {
  return axios.delete(`/api/discussions/${discussionId}/comments/${commentId}`).then(r => r.data) // no response except http code
}

export async function deleteAnswerCommentRequest(discussionId: number, answerId: number, commentId: number) {
  return axios.delete(`/api/discussions/${discussionId}/answers/${answerId}/comments/${commentId}`).then(r => r.data) // no response except http code
}
