import { useQuery } from '@tanstack/react-query'
import { fetchDiscussionAttachmentsRequest, fetchDiscussionRequest } from '../../features/discussions/api'
import { Discussion } from '../../features/discussions/discussions.types'

export const getFetchDiscussionQueryKey = (discussionId: number) => ['discussion', { id: discussionId }]

export const useFetchDiscussionQuery = (discussionId: number) =>
  useQuery({
    queryKey: getFetchDiscussionQueryKey(discussionId),
    queryFn: () => fetchDiscussionRequest(discussionId),
  })

export const useFetchDiscussionAttachmentsQuery = (discussion: Discussion | undefined) =>
  useQuery({
    queryKey: ['attachments', discussion?.id],
    queryFn: () => {
      const noteIds = collectDiscussionNoteIds(discussion)
      return fetchDiscussionAttachmentsRequest(noteIds)
    },
    enabled: !!discussion?.id,
  })

function collectDiscussionNoteIds(discussion: Discussion | undefined) {
  if (!discussion) return []

  const ids: number[] = []

  ids.push(discussion.noteId)

  if (discussion.answers) {
    for (const answer of discussion.answers ?? []) {
      ids.push(answer.noteId)

      for (const comment of answer.comments ?? []) {
        ids.push(comment.noteId)
      }
    }
  }

  for (const comment of discussion.comments ?? []) {
    ids.push(comment.noteId)
  }

  return ids
}
