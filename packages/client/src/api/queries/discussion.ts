import { useQuery } from '@tanstack/react-query'
import { fetchDiscussionRequest } from '../../features/discussions/api'

export const getFetchDiscussionQueryKey = (discussionId: number) => ['discussion', { id: discussionId }]

export const useFetchDiscussionQuery = (discussionId: number) =>
  useQuery({
    queryKey: getFetchDiscussionQueryKey(discussionId),
    queryFn: () => fetchDiscussionRequest(discussionId),
  })
