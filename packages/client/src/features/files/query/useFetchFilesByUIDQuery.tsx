import { useQuery } from '@tanstack/react-query'
import { fetchAccessibleFilesByUID } from '../../databases/databases.api'

export function useFetchFilesByUIDQuery(uids: string[]) {
  return useQuery({
    queryFn: () => fetchAccessibleFilesByUID({ uid: uids ?? []}),
    queryKey: ['user-list-files', uids],
    enabled: !!uids && uids.length > 0,
  })
}
