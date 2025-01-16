import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { toast } from 'react-toastify'
import {
  CommentPayload,
  CreateAnswerPayload,
  NoteScope,
  createAnswerCommentRequest,
  createAnswerRequest,
  createDiscussionCommentRequest,
} from '../api'
import { NoteForm } from '../discussions.types'
import { pickIdsFromFormAttachments } from '../helpers'
import { MarkdownForm } from './MarkdownForm'

export const CreateCommentEntity = ({
  canUserAnswer,
  scope,
  markdownInputRef,
  discussionId,
  answerId,
  onCancel,
  onSuccess,
}: {
  canUserAnswer: boolean
  scope: NoteScope
  markdownInputRef?: React.MutableRefObject<HTMLInputElement | null>
  discussionId: number
  answerId?: number
  onCancel?: (vals?: any) => void
  onSuccess?: () => void
}) => {
  const queryClient = useQueryClient()


  const createCommentMutation = useMutation({
    mutationKey: ['create-comment'],
    mutationFn: ({ isAnswer, ...payload }: CommentPayload) => {
      if (isAnswer) {
        const p = payload as CreateAnswerPayload
        p.title = 'answer'
        return createAnswerRequest(discussionId, p)
      }
      return answerId
        ? createAnswerCommentRequest(discussionId, answerId, { ...payload, isAnswer })
        : createDiscussionCommentRequest(discussionId, { ...payload, isAnswer })
    },
    onSuccess: () => {
      if (onSuccess) onSuccess()
      queryClient.invalidateQueries({
        queryKey: ['discussion'],
      })
      queryClient.invalidateQueries({
        queryKey: ['attachments'],
      })
      toast.success('Reply has been published')
    },
    onError: error => {
      // TODO add strong typing to error
      toast.error(`Failed to create ${error}`)
    },
  })

  const handleSubmit = (vals: NoteForm) => {

    const notify = vals.notify.length && ['author', 'all'].includes(vals.notify[0].value)
        ? vals.notify[0].value
        : vals.notify.map(n => n.value)

    return createCommentMutation.mutateAsync({
      ...vals,
      attachments: pickIdsFromFormAttachments(vals.attachments),
      notify,
    })
  }

  return (
    <MarkdownForm
      canUserAnswer={canUserAnswer}
      scope={scope}
      isComment
      isAnswerComment={!!answerId}
      onCancel={onCancel}
      markdownInputRef={markdownInputRef}
      onSubmit={handleSubmit}
      submitText="Comment"
    />
  )
}
