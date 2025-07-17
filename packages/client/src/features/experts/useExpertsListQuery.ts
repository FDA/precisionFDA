import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { expertsListRequest, IParams } from './api'

export const useExpertsListQuery = (params: IParams) => useQuery({
  queryKey: ['experts', params?.page, params.year],
  queryFn: () => expertsListRequest(params).catch(err => {
    if (err && err.message) toast.error(err.message)
  }),
})

export const useExpertsListCondensedQuery = (params: IParams) => useQuery({
  queryKey: ['experts-condensed', params?.page, params.year],
  queryFn: () => expertsListRequest(params).catch(err => {
    if (err && err.message) toast.error(err.message)
  }),
})
