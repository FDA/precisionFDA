import axios from 'axios'
import { convertDateToUserTime } from '../../utils/datetime'
import { cleanObject } from '../../utils/object'
import { Pagination } from '../home/executions/executions.types'
import { Challenge, ChallengeListParams } from './types'


export interface ChallengesListResponse {
  challenges: Challenge[];
  meta: Pagination;
}


export async function challengesRequest(params: ChallengeListParams): Promise<ChallengesListResponse> {
  const filters = cleanObject({ year: params.year, time_status: params.time_status, page: params.page, per_page: params.perPage })
  const paramQ = `?${new URLSearchParams(filters as any).toString()}`
  return axios.get(`/api/challenges${paramQ}`).then(response => response.data).then(d => ({
    ...d,
    challenges: d.challenges.map((c: any) => ({
      ...c,
      start_at: convertDateToUserTime(c.start_at),
      end_at: convertDateToUserTime(c.end_at),
      created_at: convertDateToUserTime(c.created_at),
      updated_at: convertDateToUserTime(c.updated_at),
    })),
  }))
}

export type NewsYearsListResponse = string[]
export async function challengesYearsListRequest(): Promise<NewsYearsListResponse> {
  return axios.get('/api/challenges/years').then(response => response.data.map((item: number) => item.toString()))
}

export interface ChallengeDetailstResponse {
  challenge: Challenge;
}

export async function challengeDetailsRequest(challengeId: string, custom?: boolean): Promise<ChallengeDetailstResponse> {
  const params = custom ? '?custom=true' : ''
  return axios.get(`/api/challenges/${challengeId}${params}`).then(response => response.data as any).then(d => ({
    challenge: {
      ...d.challenge,
      start_at: convertDateToUserTime(d.challenge.start_at),
      end_at: convertDateToUserTime(d.challenge.end_at),
      created_at: convertDateToUserTime(d.challenge.created_at),
      updated_at: convertDateToUserTime(d.challenge.updated_at),
    },
  } as ChallengeDetailstResponse))
}
