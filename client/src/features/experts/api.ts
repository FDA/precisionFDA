import axios from 'axios'
import { cleanObject } from '../../utils/object'
import { Pagination } from '../../types/pagination'
import { Expert, ExpertDetailsResponse } from './types'
import { backendCall } from '../../utils/api'

export interface ExpertsListResponse {
  meta?: Pagination,
  experts: Expert[],
}

export async function expertsListRequest(params: any) {
  const filters = cleanObject({ year: params.year, page: params.page })
  const paramQ = `?${new URLSearchParams(filters as any).toString()}`
  return axios.get(`/api/experts${paramQ}`).then(response => response.data as ExpertsListResponse)
}

export type NewsYearsListResponse = string[]
export async function expertsYearsListRequest(): Promise<NewsYearsListResponse> {
  return axios.get('/api/experts/years').then(response => response.data.map((item: number) => item?.toString()))
}

export const askQuestion = (
  data: { userName: string; question: string, captchaValue: string },
  expertId: string,
) => backendCall(`/api/experts/${expertId}/ask_question`, 'POST', data)

export const expertDetailsRequest = (expertId: string) => axios.get(`/api/experts/${expertId}`).then(r => r.data as ExpertDetailsResponse)