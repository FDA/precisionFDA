import { useQuery } from '@tanstack/react-query'
import { dataPortalByIdRequest, dataPortalsListRequest, fetchMainDataPortal } from './api'

export const useDataPortalListQuery = () => useQuery({
  queryKey: ['data-portals-list'],
  queryFn: dataPortalsListRequest,
})

export const useDataPortalByIdQuery = (id: string) => useQuery({
  queryKey: ['data-portals', id],
  queryFn: () => dataPortalByIdRequest(id),
})

export const useMainDataPortal = () => useQuery({
  queryKey: ['data-portals-main'],
  queryFn: () => fetchMainDataPortal(),
})
