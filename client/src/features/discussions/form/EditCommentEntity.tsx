import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { toast } from 'react-toastify'
import {
  CommentPayload,
  editAnswerCommentRequest,
  editDiscussionCommentRequest,
} from '../api'
import { MarkdownForm } from './MarkdownForm'

export const EditCommentEntity = ({
  onSuccess,
  onCancel,
  commentBody,
  commentId,
  discussionId,
  answerId,
}: {
  onSuccess?: () => void
  onCancel?: (vals: CommentPayload) => void
  commentBody: string
  commentId: number
  discussionId: number
  answerId?: number
}) => {
  const queryClient = useQueryClient()

  const editCommentMutation = useMutation({
    mutationKey: ['edit-comment'],
    mutationFn: (payload: CommentPayload) => {
      if (answerId) {
        return editAnswerCommentRequest(
          discussionId,
          answerId,
          commentId,
          payload,
        )
      }
      return editDiscussionCommentRequest(discussionId, commentId, payload)
    },
    onSuccess: (result) => {
      if(onSuccess) onSuccess()
      toast.success(`${answerId ? 'Answer': 'Comment'} has been updated`)
      queryClient.invalidateQueries({
        queryKey: ['discussion'],
      })
      queryClient.invalidateQueries({
        queryKey: ['attachments'],
      })
    },
    onError: error => {
      toast.error(`Error while editing ${error}`)
    },
  })

  const handleSubmit = async (vals: CommentPayload) => {
    await editCommentMutation.mutateAsync(vals)
  }

  const defaultValues = {
    content: commentBody,
  }

  return <MarkdownForm isComment isEdit onCancel={onCancel} onSubmit={handleSubmit} defaultValues={defaultValues} />
}
