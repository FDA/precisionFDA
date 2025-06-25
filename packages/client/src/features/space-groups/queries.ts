import { AxiosError } from 'axios'
import { useQuery } from '@tanstack/react-query'
import { ISpaceGroup } from './spaceGroups.types'
import { spaceGroupByIdRequest } from './spaceGroups.api'

export const useSpaceGroupByIdQuery = (id: number | undefined) => {
  return useQuery<ISpaceGroup, AxiosError>({
    queryKey: ['space-groups', id],
    queryFn: () => spaceGroupByIdRequest(id!),
    enabled: !!id,
  })
}