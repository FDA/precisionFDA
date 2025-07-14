import { AxiosError } from 'axios'
import { useQuery } from '@tanstack/react-query'
import { dataPortalByIdRequest, dataPortalsListRequest } from './api'
import { DataPortal } from './types'
import { ApiErrorResponse } from '../home/types'

export const useDataPortalListQuery = () => useQuery({
  queryKey: ['data-portals-list'],
  queryFn: dataPortalsListRequest,
})

export const useDataPortalByIdQuery = (id: string) => useQuery<DataPortal, AxiosError<ApiErrorResponse>>({
  queryKey: ['data-portals', id],
  queryFn: () => dataPortalByIdRequest(id),
})
