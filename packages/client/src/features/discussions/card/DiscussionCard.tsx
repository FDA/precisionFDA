import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { Markdown } from '../../../components/Markdown'
import { ReplyArrowIcon } from '../../../components/icons/ReplyArrowIcon'
import { useConfirm } from '../../modal/useConfirm'
import { AttachmentsList } from '../AttachmentsList'
import { deleteDiscussionRequest, fetchAttachmentsRequest } from '../api'
import { Discussion } from '../discussions.types'
import { groupByAttachmentType } from '../helpers'
import { StyledCommentCard, StyledMarkdown, StyledReplyButton } from '../styles'
import { CardHeader } from './CardHeader'
import { EditNoteEntity } from '../form/EditNoteEntity'

export function DiscussionCard({
  canEdit,
  canReply,
  discussion,
  onReply,
  onDelete,
}: {
  canEdit: boolean
  canReply: boolean
  discussion: Discussion
  onReply: () => void
  onDelete: () => void
}) {
  const [editMode, setEditMode] = useState(false)
  const queryClient = useQueryClient()

  const { data: attachments } = useQuery({
    queryKey: ['attachments', discussion.noteId],
    queryFn: () => fetchAttachmentsRequest(discussion.noteId),
    select: groupByAttachmentType,
    enabled: !!discussion.noteId,
  })

  const deleteMutation = useMutation({
    mutationKey: ['delete-discussion'],
    mutationFn: () => {
      queryClient.invalidateQueries({
        queryKey: ['space'],
      })

      return deleteDiscussionRequest(discussion.id)
    },
    onSuccess: () => {
      if (onDelete) onDelete()
    },
  })
  const { open: openConfirmation, Confirm: ConfirmSubmit } = useConfirm({
    onOk: deleteMutation.mutate,
    okText: 'OK',
    headerText: 'You are about to delete this discussion',
    body: (
      <div>
        <p>Are you sure you would like to continue?</p>
      </div>
    ),
  })

  if (editMode) {
    return (
      <StyledMarkdown $isAnswer={false}>
        <EditNoteEntity
          onSuccess={() => setEditMode(false)}
          onCancel={() => setEditMode(false)}
          discussionId={discussion.id}
          content={discussion.content}
          scope={discussion.scope}
          noteId={discussion.noteId}
        />
      </StyledMarkdown>
    )
  }

  return (
    <StyledCommentCard $isAnswer={false}>
      <CardHeader
        timestamp={discussion.createdAt}
        cardType="discussion"
        canUserEdit={canEdit}
        user={discussion.user}
        onClickEdit={() => setEditMode(true)}
        onClickDelete={openConfirmation}
      />
      <StyledMarkdown>
        <Markdown data={discussion.content} />
      </StyledMarkdown>
      <AttachmentsList attachments={attachments} />
      {canReply && (
        <StyledReplyButton onClick={() => onReply()}>
          <ReplyArrowIcon height={12} />
          Reply
        </StyledReplyButton>
      )}
      <ConfirmSubmit />
    </StyledCommentCard>
  )
}
