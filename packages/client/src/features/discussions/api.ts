import axios from 'axios'
import { HomeScope, IFilter, MetaV2, ServerScope } from '../home/types'
import { Params, prepareListFetch } from '../home/utils'
import { Attachment, Discussion, PostAttachments } from './discussions.types'

export type BasePayload = {
  content: string
  // attachments are referred by ID
  attachments: PostAttachments
}

export type CommentPayload = BasePayload & {
  isAnswer: boolean
  notify: string[] | string
}

export type NotePayload = BasePayload & {
  id: number
}

export type DiscussionPayload = BasePayload & {
  title: string
  notify: string[] | string
  scope: ServerScope
}

export type CreateReplyPayload = BasePayload & {
  title: string
  notify: string[] | string
  scope: ServerScope
  type: 'Answer' | 'Comment'
  parentId?: number
}

export type IdResponse = {
  id: number
}
export type EditDiscussionPayload = Partial<DiscussionPayload & IdResponse>

export type EditDiscussionReplyPayload = Partial<CreateReplyPayload & IdResponse>
export type NoteScope = 'public' | `space-${number}`

export async function createDiscussionRequest(payload: DiscussionPayload) {
  return axios.post<IdResponse>('/api/v2/discussions', payload).then(r => r.data)
}

export async function createReplyRequest(discussionId: number, payload: CreateReplyPayload) {
  return axios.post<IdResponse>(`/api/v2/discussions/${discussionId}/replies`, { discussionId, ...payload }).then(r => r.data)
}

export async function editDiscussionRequest(discussionId: number, payload: EditDiscussionPayload) {
  return axios.patch<IdResponse>(`/api/v2/discussions/${discussionId}`, payload).then(r => r.data)
}

export async function editReplyRequest(discussionId: number, replyId: number, payload: EditDiscussionReplyPayload) {
  return axios.patch<IdResponse>(`/api/v2/discussions/${discussionId}/replies/${replyId}`, payload).then(r => r.data)
}

export async function editAnswerCommentRequest(
  discussionId: number,
  answerId: number,
  commentId: number,
  payload: CommentPayload,
) {
  return axios
    .put<IdResponse>(`/api/v2/discussions/${discussionId}/answers/${answerId}/comments/${commentId}`, payload)
    .then(r => r.data)
}

export interface DiscussionListResponse {
  data: Discussion[]
  meta: MetaV2
}

export async function fetchDiscussionsRequest(filters: IFilter[], params: Params) {
  const query = prepareListFetch(filters, { ...params, scope: params.entityScope as HomeScope })
  const paramQ = `?${new URLSearchParams(query).toString()}`
  return axios.get(`/api/v2/discussions${paramQ}`).then(r => r.data as DiscussionListResponse)
}

export async function fetchDiscussionRequest(discussionId: number) {
  return axios.get<Discussion>(`/api/v2/discussions/${discussionId}`).then(r => r.data)
}

export async function fetchAttachmentsRequest(noteId?: number) {
  if (!noteId) return []
  // yes this is wrong - i just want to avoid creating another ruby endpoint class for now.
  return axios.get(`/api/v2/discussions/${noteId}/attachments`).then(r => r.data as Attachment[])
}

export async function deleteDiscussionRequest(discussionId: number) {
  return axios.delete(`/api/v2/discussions/${discussionId}`).then(r => r.data) // no response except http code
}

export async function deleteAnswerRequest(discussionId: number, replyId: number) {
  return axios.delete(`/api/v2/discussions/${discussionId}/replies/${replyId}`).then(r => r.data) // no response except http code
}

export async function deleteDiscussionCommentRequest(discussionId: number, commentId: number) {
  return axios.delete(`/api/v2/discussions/${discussionId}/comments/${commentId}`).then(r => r.data) // no response except http code
}

export async function deleteAnswerCommentRequest(discussionId: number, answerId: number, commentId: number) {
  return axios.delete(`/api/v2/discussions/${discussionId}/answers/${answerId}/comments/${commentId}`).then(r => r.data) // no response except http code
}

export async function followDiscussionRequest(discussionId: number) {
  return axios.post(`/api/v2/discussions/${discussionId}/follow`).then(r => r.data)
}

export async function unfollowDiscussionRequest(discussionId: number) {
  return axios.post(`/api/v2/discussions/${discussionId}/unfollow`).then(r => r.data)
}
