import { QueryObserverOptions, useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { newsAdminAllRequest, newsListRequest } from './api'
import { NewsItem } from './types'

type ParamsType = Record<string, number | string | null | undefined>

export const useNewsListQuery = (params: ParamsType) => {
  return useQuery({
    queryKey: ['news', params],
    queryFn: () => newsListRequest(params),
  })
}

export const useNewsAdminAllRequest = (params: ParamsType, opt?: QueryObserverOptions) =>
  useQuery<NewsItem[]>({
    queryKey: ['news/admin', params],
    queryFn: () =>
      newsAdminAllRequest(params).catch(err => {
        if (err && err.message) toast.error(err.message)
      }),
    ...(opt as any),
  })
