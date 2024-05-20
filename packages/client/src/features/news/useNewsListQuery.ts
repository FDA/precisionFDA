import { QueryObserverOptions, useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { newsAdminAllRequest, newsListRequest } from './api'

type PramasType = Record<string, number | string | null | undefined>

export const useNewsListQuery = (params: PramasType, opt?: QueryObserverOptions) => {
  return useQuery({
    queryKey: ['news', params],
    queryFn: () => newsListRequest(params).catch(err => {
      if (err && err.message) toast.error(err.message)
    }),
    ...opt as any
  })}

export const useNewsAdminAllRequest = (params: PramasType, opt?: QueryObserverOptions) => useQuery({
  queryKey: ['news/admin', params],
  queryFn: () => newsAdminAllRequest(params).catch(err => {
    if (err && err.message) toast.error(err.message)
  }),
  ...opt as any
})
