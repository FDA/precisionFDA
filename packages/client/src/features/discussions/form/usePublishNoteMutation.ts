import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { PublishPayload, publishAnswerRequest, publishDiscussionRequest } from '../api'

export function usePublishNoteMutation() {
  const publishMutation = useMutation({
    mutationKey: ['publish-discussion'],
    mutationFn: ({
      isAnswer,
      discussionId,
      ...payload
    }: PublishPayload & { isAnswer?: boolean; discussionId: number; id: number }) => {
      if (isAnswer) {
        return publishAnswerRequest(discussionId, payload)
      }
      return publishDiscussionRequest(payload)
    },
    onError: () => {
      // todo investigate- can we show something less generic?
      toast.error('Error while publishing discussion.')
    },
  })

  return publishMutation
}
