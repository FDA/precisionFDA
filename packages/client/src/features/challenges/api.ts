import axios from 'axios'
import { convertDateToUserTime } from '../../utils/datetime'
import { cleanObject } from '../../utils/object'
import { Pagination } from '../executions/executions.types'
import { Challenge, ChallengeListParams } from './types'
import { processFile } from '../resources/uploadImage'

interface ChallengePayloadRequest {
  name: string
  description: string
  scope: string
  app_owner_id: string
  start_at: Date
  end_at: Date
  status: string
  host_lead_dxuser: string
  guest_lead_dxuser: string
  card_image_id?: number | null
  card_image_url?: string | null
  pre_registration_url: string | null,
}

type ServerChallengeDates = {
  start_at: string;
  end_at: string;
  created_at: string;
  updated_at: string;
}

type ChallengeResponse = {
  challenge: Challenge & ServerChallengeDates
}

type ListChallengeResponse = {
  challenges: (Challenge & ServerChallengeDates)[]
  meta: Pagination
}

type ListChallenges = {
  challenges: Challenge[]
  meta: Pagination
}

export async function challengesRequest(params: ChallengeListParams): Promise<ListChallenges> {
  const filters = cleanObject({ year: params.year, time_status: params.time_status, page: params.page, per_page: params.perPage })
  const paramQ = `?${new URLSearchParams(filters as any).toString()}`
  return axios.get(`/api/challenges${paramQ}`).then(response => response.data as ListChallengeResponse).then(d => ({
    ...d,
    challenges: d.challenges.map(c => ({
      ...c,
      start_at: convertDateToUserTime(c.start_at),
      end_at: convertDateToUserTime(c.end_at),
      created_at: convertDateToUserTime(c.created_at),
      updated_at: convertDateToUserTime(c.updated_at),
    })),
  }))
}

export type NewsYearsListResponse = number[]
export async function challengesYearsListRequest() {
  return axios.get<NewsYearsListResponse>('/api/challenges/years').then(response => response.data.map(item => item.toString()))
}

export async function challengeDetailsRequest(challengeId: string, custom?: boolean): Promise<Challenge> {
  const params = custom ? '?custom=true' : ''
  return axios.get(`/api/challenges/${challengeId}${params}`).then(r => r.data.challenge as ChallengeResponse['challenge']).then((d) => ({
    ...d,
    start_at: convertDateToUserTime(d.start_at),
    end_at: convertDateToUserTime(d.end_at),
    created_at: convertDateToUserTime(d.created_at),
    updated_at: convertDateToUserTime(d.updated_at),
  }))
}

export type ChallengePayload = ChallengePayloadRequest & { image: File }
type ChallengeCardImageResponse = { uid: string, id: number }

export async function createChallengeImage(file: File) {
  const response = await axios.post<ChallengeCardImageResponse>('/api/create_challenge_card_image', { name: file.name })
  const fileUid = response.data.uid
  const fileId = response.data.id

  await processFile(file, fileUid)
  return fileId
}

export async function updateChallengeRequest(payload: ChallengePayloadRequest, id: number) {
  return axios.put(`/api/challenges/${id}`, { challenge: payload }).then(r => r.data)
}

export async function editChallengeRequest({ image, ...payload }: ChallengePayload, id: number) {
  const body = payload
  if (image) {
    body.card_image_id = await createChallengeImage(image)
  }
  return updateChallengeRequest(body, id)
}

export async function createChallengeRequest({ image, ...payload }: ChallengePayload) {
  const challenge = await axios.post<ChallengeResponse>('/api/challenges/', { challenge: payload }).then(r => r.data.challenge)
  const fileId = await createChallengeImage(image)
  return updateChallengeRequest({ ...challenge, card_image_id: fileId }, challenge.id)
}
