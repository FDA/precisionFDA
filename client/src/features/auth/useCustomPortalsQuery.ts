import { useQuery } from '@tanstack/react-query'
import { customPortalsRequest } from './api'

export interface CustomPortal {
  name: string
  id: number
  spaceId: number
}

export const useCustomPortalsQuery = () => useQuery({
  queryKey: ['data_portals/custom'],
  queryFn: customPortalsRequest,
})