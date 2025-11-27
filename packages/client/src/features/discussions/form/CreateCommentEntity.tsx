import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { RefCallBack } from 'react-hook-form'
import { toast } from 'react-toastify'
import { CommentPayload, CreateReplyPayload, NoteScope, createReplyRequest } from '../api'
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
  markdownInputRef?: RefCallBack
  discussionId: number
  answerId?: number
  onCancel?: (vals: NoteForm) => void
  onSuccess?: () => void
}) => {
  const queryClient = useQueryClient()

  const createCommentMutation = useMutation({
    mutationKey: ['create-comment'],
    mutationFn: ({ isAnswer, ...payload }: CommentPayload) => {
      const p = payload as CreateReplyPayload
      if (isAnswer) {
        p.title = 'answer'
        p.type = 'Answer'
      } else {
        p.title = 'comment'
        p.type = 'Comment'
      }
      if (answerId) {
        p.parentId = answerId
      }
      return createReplyRequest(discussionId, p)
    },
    onSuccess: () => {
      if (onSuccess) onSuccess()
      queryClient.invalidateQueries({
        queryKey: ['discussion'],
      })
      toast.success('Reply has been published')
    },
    onError: error => {
      // TODO add strong typing to error
      toast.error(`Failed to create ${error}`)
    },
  })

  const handleSubmit = (vals: NoteForm) => {
    const notify =
      vals.notify.length && ['author', 'all'].includes(vals.notify[0].value)
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
