import { type UseQueryResult, useQuery } from '@tanstack/react-query'
import { type FetchAccessibleFilesResponse, fetchAccessibleFiles } from '../files.api'

export function useFetchFilesByUIDQuery(uids: string[]): UseQueryResult<FetchAccessibleFilesResponse, Error> {
  return useQuery({
    queryFn: () =>
      fetchAccessibleFiles({ uids: uids.join(','), filter: { states: ['closed'] }, fields: { path: true } }),
    queryKey: ['user-list-files', uids],
    enabled: !!uids && uids.length > 0,
  })
}
