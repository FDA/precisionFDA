import { QueryObserverOptions, useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { newsAdminAllRequest, newsListRequest, NewsListResponse } from './api'
import { NewsItem } from './types'

type PramasType = Record<string, number | string | null | undefined>

export const useNewsListQuery = (params: PramasType, opt?: QueryObserverOptions<NewsListResponse>) => {
  return useQuery<NewsListResponse>({
    queryKey: ['news', params],
    queryFn: () => newsListRequest(params).catch(err => {
      if (err && typeof err === 'object' && 'message' in err) {
        toast.error(err.message as string)
      }
      throw err
    }),
    ...opt,
  })
}

export const useNewsAdminAllRequest = (params: PramasType, opt?: QueryObserverOptions<NewsItem[]>) => {
  return useQuery<NewsItem[]>({
    queryKey: ['news/admin', params],
    queryFn: () => newsAdminAllRequest(params).catch(err => {
      if (err && typeof err === 'object' && 'message' in err) {
        toast.error(err.message as string)
      }
      throw err
    }),
    ...opt,
  })
}