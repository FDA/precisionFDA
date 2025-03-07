import { useMutation } from '@tanstack/react-query'
import { Discussion } from '../../features/discussions/discussions.types'
import { followDiscussionRequest, unfollowDiscussionRequest } from '../../features/discussions/api'

const toggleFollowDiscussion = async (discussion: Discussion): Promise<Discussion> => {
  const mutateFn = discussion.following ? unfollowDiscussionRequest : followDiscussionRequest
  return mutateFn(discussion.id)
}

export const useToggleFollowDiscussionMutation = () =>
  useMutation({
    mutationFn: toggleFollowDiscussion,
  })
