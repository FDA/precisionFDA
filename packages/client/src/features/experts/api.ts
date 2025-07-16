import axios from 'axios'
import { cleanObject } from '../../utils/object'
import { PaginationMetaV2 } from '../../types/pagination'
import { Expert, ExpertDetailsResponse } from './types'

export interface IParams {
  page?: number,
  year?: number,
}

export interface ExpertsListResponse {
  meta?: PaginationMetaV2
  data: Expert[]
}

export async function expertsListRequest(params: IParams) {
  const filters = cleanObject({ year: params.year?.toString(), page: params.page?.toString() })
  const paramQ = `?${new URLSearchParams(filters).toString()}`
  return axios.get(`/api/v2/experts${paramQ}`).then(response => response.data as ExpertsListResponse)
}

export type NewsYearsListResponse = string[]
export async function expertsYearsListRequest(): Promise<NewsYearsListResponse> {
  return axios.get('/api/experts/years').then(response => response.data.map((item: number) => item?.toString()))
}

export const askQuestion = (data: { userName: string; question: string; captchaValue: string }, expertId: string) =>
  axios.post(`/api/experts/${expertId}/ask_question`, data).then(response => response.data)

export const expertDetailsRequest = (expertId: string) =>
  axios.get(`/api/experts/${expertId}`).then(r => r.data as ExpertDetailsResponse)

export const deleteExpertRequest = (expertId: number) => {
  return axios.delete(`/api/v2/experts/${expertId}`).then(response => response.data)
}
