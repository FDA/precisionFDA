import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { expertsListRequest } from './api'

interface IParams {
  page?: number,
  year?: number,
}

export const useExpertsListQuery = (params: IParams) => useQuery(['experts', params?.page, params.year], () => expertsListRequest(params), {
  onError: (err: any) => {
    if (err && err.message) toast.error(err.message)
  },
})

export const useExpertsListCondensedQuery = (params: IParams) => useQuery(['experts-condensed', params?.page, params.year], () => expertsListRequest(params), {
  onError: (err: any) => {
    if (err && err.message) toast.error(err.message)
  },
})
