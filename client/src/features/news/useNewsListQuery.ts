import { QueryObserverOptions, useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { newsAdminAllRequest, newsListRequest } from './api'

type PramasType = Record<string, number | string | null | undefined>

export const useNewsListQuery = (params: PramasType, opt?: QueryObserverOptions) => {
  return useQuery(
    ['news', params],
    () => newsListRequest(params),
    {
      onError: (err: any) => {
        if (err && err.message) toast.error(err.message)
      },
      ...opt as any,
    })}

export const useNewsAdminAllRequest = (params: PramasType, opt?: QueryObserverOptions) => useQuery(
  ['news/admin', params],
  () => newsAdminAllRequest(params),
  {
    onError: (err: any) => {
      if (err && err.message) toast.error(err.message)
    },
    ...opt as any,
  })