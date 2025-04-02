import { useQuery } from '@tanstack/react-query'
import { fetchPublishingTreeRoot } from './publishing.api'

export const usePublishingTreeRootQuery = (identifier: string, type: string) => {
  return useQuery({
    queryKey: [identifier, 'publishing-treeroot'],
    queryFn: () => fetchPublishingTreeRoot(identifier, type),
  })
}
