import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { toast } from 'react-toastify'
import { CommentPayload, EditDiscussionReplyPayload, editReplyRequest, NoteScope } from '../api'
import { NoteForm } from '../discussions.types'
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
  onCancel?: (vals: NoteForm) => void
  commentBody: string
  commentId: number
  discussionId: number
  answerId?: number
}) => {
  const queryClient = useQueryClient()

  const editCommentMutation = useMutation({
    mutationKey: ['edit-comment'],
    mutationFn: (payload: CommentPayload) => {
      const p: EditDiscussionReplyPayload = { ...payload, type: 'Comment' }
      if (answerId) {
        p.parentId = answerId
      }
      return editReplyRequest(discussionId, commentId, p)
    },
    onSuccess: () => {
      if (onSuccess) onSuccess()
      toast.success(`${answerId && !commentId ? 'Answer' : 'Comment'} has been updated`)
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

  const handleSubmit = async (vals: NoteForm) => {
    const payload: CommentPayload = {
      content: vals.content,
      isAnswer: vals.isAnswer,
      notify: vals.notify.map(n => n.value),
      attachments: {
        files: vals.attachments.files.map(f => f.id),
        folders: vals.attachments.folders.map(f => f.id),
        apps: vals.attachments.apps.map(f => f.id),
        jobs: vals.attachments.jobs.map(f => f.id),
        assets: vals.attachments.assets.map(f => f.id),
        comparisons: vals.attachments.comparisons.map(f => f.id),
      },
    }
    await editCommentMutation.mutateAsync(payload)
  }

  const defaultValues: NoteForm = {
    content: commentBody,
    isAnswer: false,
    notify: [],
    attachments: {
      files: [],
      folders: [],
      apps: [],
      comparisons: [],
      assets: [],
      jobs: [],
    },
  }

  return (
    <MarkdownForm
      canUserAnswer={false}
      isComment
      isEdit
      onCancel={onCancel}
      onSubmit={handleSubmit}
      defaultValues={defaultValues}
      scope={'private' as NoteScope}
    />
  )
}
