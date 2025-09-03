import { useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { spaceGroupByIdRequest } from './api'
import { ISpaceGroup } from './types'

export const useSpaceGroupByIdQuery = (id: number | string | undefined) => {
  return useQuery<ISpaceGroup, AxiosError>({
    queryKey: ['space-groups', id],
    queryFn: () => spaceGroupByIdRequest(id!),
    enabled: !!id,
  })
}
