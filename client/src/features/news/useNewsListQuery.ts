import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { newsListRequest } from './api'

export const useNewsListQuery = (params: Record<string, any>) => useQuery(
  ['news', params?.year, params?.page],
  () => newsListRequest(params),
  {
    onError: (err: any) => {
      if (err && err.message) toast.error(err.message)
    },
  })
