import axios from 'axios'
import queryString from 'query-string'
import { convertDateToUserTime } from '../../utils/datetime'
import { Challenge, ChallengeListParams, ChallengeOld } from './types'
import { processFile } from '../resources/uploadImage'
import { PaginationMetaV2 } from '../../types/pagination'

interface ChallengePayloadRequest {
  name: string
  description: string
  scope: string
  appOwnerId: number
  startAt: Date
  endAt: Date
  status: string
  hostLeadDxuser: string
  guestLeadDxuser: string
  cardImageId?: number | null
  cardImageUrl?: string | null
  preRegistrationUrl: string | null,
}

type ServerChallengeDates = {
  startAt: string;
  endAt: string;
  created_at: string;
  updated_at: string;
}

type ListChallengeResponse = {
  data: (Challenge & ServerChallengeDates)[]
  meta: PaginationMetaV2
}

type ListChallenges = {
  data: Challenge[]
  meta: PaginationMetaV2
}

export async function challengesRequest(params: ChallengeListParams): Promise<ListChallenges> {
  const paramQ = queryString.stringify({
    'filter[year]': params.year,
    'filter[status]': params.timeStatus,
    page: params.page,
    pageSize: params.pageSize,
  })
  return axios.get(`/api/v2/challenges?${paramQ}`).then(response => response.data as ListChallengeResponse).then(d => ({
    ...d,
    data: d.data.map(c => ({
      ...c,
      startAt: convertDateToUserTime(c.startAt),
      endAt: convertDateToUserTime(c.endAt),
      created_at: convertDateToUserTime(c.created_at),
      updated_at: convertDateToUserTime(c.updated_at),
    })),
  }))
}

export type NewsYearsListResponse = number[]
export async function challengesYearsListRequest() {
  return axios.get<NewsYearsListResponse>('/api/challenges/years').then(response => response.data.map(item => item.toString()))
}

export async function challengeDetailsRequest(challengeId: string, custom?: boolean): Promise<ChallengeOld> {
  const params = custom ? '?custom=true' : ''
  return axios.get(`/api/challenges/${challengeId}${params}`).then(r => r.data.challenge as ChallengeOld).then((d) => ({
    ...d,
    start_at: convertDateToUserTime(d.start_at),
    end_at: convertDateToUserTime(d.end_at),
    created_at: convertDateToUserTime(d.created_at),
    updated_at: convertDateToUserTime(d.updated_at),
  } as ChallengeOld))
}

export async function challengeByID(challengeId: number | string, custom?: boolean) {
  const params = custom ? '?custom=true' : ''
  return axios.get(`/api/v2/challenges/${challengeId}${params}`)
  .then(r => r.data)
  .then((d) => ({
    ...d,
    startAt: convertDateToUserTime(d.startAt),
    endAt: convertDateToUserTime(d.endAt),
  } as Challenge))
}

export type ChallengePayload = ChallengePayloadRequest & { image: File }
type ChallengeCardImageResponse = { uid: string, id: number }

export async function createChallengeImage(challengeId: number | string, file: File) {
  const response = await axios.post<ChallengeCardImageResponse>('/api/create_challenge_card_image', { name: file.name, challengeId })
  const fileUid = response.data.uid
  const fileId = response.data.id

  await processFile(file, fileUid)
  return fileId
}

export async function updateChallengeRequest(payload: ChallengePayloadRequest, id: number) {


  return axios.put(`/api/v2/challenges/${id}`, payload).then(r => r.data)
}

export async function editChallengeRequest({ image, ...payload }: ChallengePayload, id: number) {
  const body = payload
  if (image) {
    body.cardImageId = await createChallengeImage(id, image)
  }
  return updateChallengeRequest(body, id)
}

export async function createChallengeRequest({ image, ...payload }: ChallengePayload) {
  const id = await axios.post<number>('/api/v2/challenges/', payload).then(r => r.data)
  await createChallengeImage(id, image)
}

export async function challengeContentRequest(id: number) {
  return axios.get(`/api/v2/challenges/${id}/content`).then(r => r.data)
}


export type ContentType = 'pre-registration' | 'info' | 'results'
export type UpdateChallengeContent = {
  type: ContentType
  content: string
  editorState: string
}
export async function updateChallengeContentRequest(id: number|string, payload: UpdateChallengeContent) {
  return axios.put(`/api/v2/challenges/${id}/content`, payload).then(r => r.data)
}
