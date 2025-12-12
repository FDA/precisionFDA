import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { Markdown } from '../../../components/Markdown'
import { ReplyArrowIcon } from '../../../components/icons/ReplyArrowIcon'
import { StyledMarkdown } from '../../../styles/commonStyles'
import { useConfirm } from '../../modal/useConfirm'
import { AttachmentsList } from '../AttachmentsList'
import { useDiscussionContext } from '../DiscussionShow'
import { deleteReplyRequest, NoteScope } from '../api'
import { DiscussionReply } from '../discussions.types'
import { EditNoteEntity } from '../form/EditNoteEntity'
import { groupByAttachmentType } from '../helpers'
import { StyledCommentCard, StyledReplyButton } from '../styles'
import { CardHeader } from './CardHeader'
import { toastSuccess } from '../../../components/NotificationCenter/ToastHelper'

export function ReplyCard({
  canEdit,
  canReply,
  reply,
  onReply,
  scope,
  replyType = 'comment',
}: {
  canEdit: boolean
  canReply: boolean
  reply: DiscussionReply
  onReply?: () => void
  scope: NoteScope
  replyType: 'answer' | 'comment'
}) {
  const [editMode, setEditMode] = useState(false)
  const queryClient = useQueryClient()

  const { attachments: replyAttachments } = useDiscussionContext()
  const attachments = groupByAttachmentType(replyAttachments?.[reply.noteId] ?? [])

  const deleteMutation = useMutation({
    mutationKey: ['delete-discussion-reply'],
    mutationFn: () => {
      queryClient.invalidateQueries({
        queryKey: ['space'],
      })
      return deleteReplyRequest(reply.discussionId, reply.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['discussion'],
      })
      toastSuccess(`${replyType === 'answer' ? 'Answer' : 'Comment'} successfully removed`)
    },
  })
  const { open: openConfirmation, Confirm: ConfirmSubmit } = useConfirm({
    onOk: deleteMutation.mutate,
    okText: 'OK',
    headerText: `You are about to delete this ${replyType.toLowerCase()}`,
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
        discussionId={reply.discussionId}
        content={reply.content}
        scope={scope}
        answerId={reply.id}
        noteId={reply.noteId}
      />
    )
  }

  return (
    <StyledCommentCard $isAnswer={replyType === 'answer'}>
      <CardHeader
        timestamp={reply.createdAt}
        cardType={replyType}
        canUserEdit={canEdit}
        user={reply.user}
        onClickEdit={() => setEditMode(true)}
        onClickDelete={openConfirmation}
      />
      <StyledMarkdown>
        <Markdown data={reply.content} />
      </StyledMarkdown>
      <AttachmentsList attachments={attachments} />
      {canReply && (
        <StyledReplyButton data-testid="reply-answer" onClick={() => onReply()}>
          <ReplyArrowIcon height={12} />
          Reply
        </StyledReplyButton>
      )}
      <ConfirmSubmit />
    </StyledCommentCard>
  )
}
