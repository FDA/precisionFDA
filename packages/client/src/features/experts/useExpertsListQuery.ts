import { useQuery } from '@tanstack/react-query'
import { expertsListRequest, IParams } from './api'
import { toastError } from '../../components/NotificationCenter/ToastHelper'

export const useExpertsListQuery = (params: IParams) =>
  useQuery({
    queryKey: ['experts', params?.page, params.year],
    queryFn: () =>
      expertsListRequest(params).catch(err => {
        if (err && err.message) toastError(err.message)
      }),
  })

export const useExpertsListCondensedQuery = (params: IParams) =>
  useQuery({
    queryKey: ['experts-condensed', params?.page, params.year],
    queryFn: () =>
      expertsListRequest(params).catch(err => {
        if (err && err.message) toastError(err.message)
      }),
  })
