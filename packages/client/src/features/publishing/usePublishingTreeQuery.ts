import { useQuery } from '@tanstack/react-query'
import { fetchPublishingTreeRoot } from './publishing.api'

export const usePublishingTreeRootQuery = (identifier: string | null, type: string | null) => {
  return useQuery({
    queryKey: [identifier, 'publishing-treeroot'],
    // biome-ignore lint/style/noNonNullAssertion: only executing query if identifier and type are not null
    queryFn: () => fetchPublishingTreeRoot(identifier!, type!),
    enabled: !!identifier && !!type,
  })
}
