import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Markdown } from '../../../components/Markdown'
import { CardHeader } from './CardHeader'
import { Comment } from '../discussions.types'
import { EditCommentEntity } from '../form/EditCommentEntity'
import { StyledCommentCard, StyledMarkdown } from '../styles'
import { useConfirm } from '../../modal/useConfirm'
import { deleteAnswerCommentRequest, deleteDiscussionCommentRequest } from '../api'

export function CommentCard({
  answerId,
  discussionId,
  comment,
  canUserEdit,
}: {
  answerId?: number
  discussionId: number
  comment: Comment
  canUserEdit: boolean
}) {
  const queryClient = useQueryClient()
  const [editMode, setEditMode] = useState(false)

  const deleteMutation = useMutation({
    mutationKey: ['delete-comment-discussion'],
    mutationFn: () => {
      if(answerId) {
        return deleteAnswerCommentRequest(discussionId, answerId, comment.id)
      }
      return deleteDiscussionCommentRequest(discussionId, comment.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['discussion'],
      })
    },
  })

  const { open: openConfirmation, Confirm: ConfirmSubmit } = useConfirm({
    onOk: deleteMutation.mutate,
    okText: 'OK',
    headerText: 'You are about to delete this comment.',
    body: (
      <div>
        <p>Are you sure you would like to continue?</p>
      </div>
    ),
  })

  if (comment && editMode) {
    return (
      <EditCommentEntity
        onSuccess={() => setEditMode(false)}
        onCancel={() => setEditMode(false)}
        commentBody={comment.body}
        discussionId={discussionId}
        commentId={comment.id}
        answerId={answerId}
      />
    )
  }

  return (
    <StyledCommentCard>
      <CardHeader
        timestamp={comment.createdAt}
        cardType="comment"
        canUserEdit={canUserEdit}
        user={comment.user}
        onClickEdit={() => setEditMode(true)}
        onClickDelete={() => openConfirmation()}
      />
      <StyledMarkdown>
        <Markdown data={comment.body} />
      </StyledMarkdown>
      <ConfirmSubmit />
    </StyledCommentCard>
  )
}
