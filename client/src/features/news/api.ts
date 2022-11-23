import axios from 'axios'
import { Pagination } from '../../types/pagination'
import { cleanObject } from '../../utils/object'
import { NewsItem, NewsListParams } from './types'

export interface NewsListResponse {
  meta?: Pagination,
  news_items?: NewsItem[],
}

export async function newsListRequest(params: NewsListParams): Promise<NewsListResponse> {
  const filters = cleanObject({ year: params.year, page: params.page, per_page: params.perPage })
  const paramQ = `?${new URLSearchParams(filters as any).toString()}`
  return axios.get(`/api/news${paramQ}`).then(response => response.data)
}

export type NewsYearsListResponse = string[]
export async function newsYearsListRequest(): Promise<NewsYearsListResponse> {
  return axios.get('/api/news/years').then(response => response.data.map((item: number) => item.toString()))
}
