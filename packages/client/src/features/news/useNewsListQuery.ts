import { QueryObserverOptions, useQuery } from '@tanstack/react-query'
import { newsAdminAllRequest, newsListRequest } from './api'
import { toastError } from '../../components/NotificationCenter/ToastHelper'
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
        if (err && err.message) toastError(err.message)
      }),
    ...(opt as any),
  })
