import axios from 'axios'
import { Pagination } from '../../types/pagination'
import { cleanObject } from '../../utils/object'
import { NewsItem, NewsListParams } from './types'

export interface NewsListResponse {
  meta?: Pagination,
  news_items?: NewsItem[],
}

export async function newsListRequest(params: NewsListParams) {
  const filters = cleanObject({ year: params.year, type: params.type, page: params.page, per_page: params.perPage, orderBy: params.orderBy })
  const paramQ = `?${new URLSearchParams(filters as any).toString()}`
  return axios.get(`/api/news${paramQ}`).then(response => response.data as NewsListResponse)
}

export async function newsAdminAllRequest(params: NewsListParams) {
  const filters = cleanObject({ year: params.year, type: params.type, page: params.page, per_page: params.perPage })
  const paramQ = `?${new URLSearchParams(filters as any).toString()}`
  return axios.get(`/api/news/all${paramQ}`).then(response => response.data as NewsItem[])
}

export async function newsItemRequest(id: string) {
  return axios.get(`/api/news/${id}`).then(response => response.data as NewsItem)
}

export type NewsYearsListResponse = string[]
export async function newsYearsListRequest(): Promise<NewsYearsListResponse> {
  return axios.get('/api/news/years').then(response => response.data.map((item: number) => item.toString()))
}
export interface CreateNewsItemResponse {
  error?: Error;
}
export interface CreateNewsItemPayload {
  title?: string;
  isPublication?: boolean;
}

export async function createNewsItemRequest(payload: CreateNewsItemPayload) {
  return axios.post('/api/news', { news_item: payload }).then(r => r.data as CreateNewsItemResponse)
}

export async function editNewsItemRequest(id: string | number, payload: CreateNewsItemPayload) {
  return axios.put(`/api/news/${id}`, { news_item: payload }).then(r => r.data as CreateNewsItemResponse)
}
export async function deleteNewsItemRequest(id: string | number) {
  return axios.delete(`/api/news/${id}`).then(r => r.data as any)
}

interface NewsPositionReqBody {
  news_items: Record<number, number>
}

export async function savePositionsRequest(payload: NewsPositionReqBody['news_items']) {
  return axios.post('/api/news/positions', { news_items: payload }).then(r => r.data as any)
}
