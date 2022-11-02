import axios from 'axios'
import { cleanObject } from '../../utils/object'
import { IPagination } from '../home/types'
import { NewsItem, NewsListParams } from './types'

export interface NewsListResponse {
  meta?: IPagination,
  news_items?: NewsItem[],
}

export async function newsListRequest(params: NewsListParams): Promise<NewsListResponse> {
  const filters = cleanObject({ year: params.year, page: params.pagination.pageParam, per_page: params.pagination.perPageParam })
  const paramQ = `?${new URLSearchParams(filters as any).toString()}`
  return axios.get(`/api/news${paramQ}`).then(response => response.data)
}

export type NewsYearsListResponse = string[]
export async function newsYearsListRequest(): Promise<NewsYearsListResponse> {
  return axios.get('/api/news/years').then(response => response.data.map((item: number) => item.toString()))
}
