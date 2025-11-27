import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { Markdown } from '../../../components/Markdown'
import { ReplyArrowIcon } from '../../../components/icons/ReplyArrowIcon'
import { StyledMarkdown } from '../../../styles/commonStyles'
import { useConfirm } from '../../modal/useConfirm'
import { AttachmentsList } from '../AttachmentsList'
import { deleteDiscussionRequest } from '../api'
import { Attachment, Discussion } from '../discussions.types'
import { EditNoteEntity } from '../form/EditNoteEntity'
import { groupByAttachmentType } from '../helpers'
import { StyledCommentCard, StyledReplyButton } from '../styles'
import { CardHeader } from './CardHeader'

export function DiscussionCard({
  canEdit,
  canReply,
  discussion,
  discussionAttachments,
  onReply,
  onDelete,
}: {
  canEdit: boolean
  canReply: boolean
  discussion: Discussion
  discussionAttachments?: Attachment[]
  onReply: () => void
  onDelete: () => void
}) {
  const [editMode, setEditMode] = useState(false)
  const queryClient = useQueryClient()

  const attachments = groupByAttachmentType(discussionAttachments ?? [])

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
      <EditNoteEntity
        onSuccess={() => setEditMode(false)}
        onCancel={() => setEditMode(false)}
        discussionId={discussion.id}
        content={discussion.content}
        scope={discussion.scope}
        noteId={discussion.noteId}
      />
    )
  }

  return (
    <StyledCommentCard>
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
