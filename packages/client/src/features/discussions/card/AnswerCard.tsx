import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { Markdown } from '../../../components/Markdown'
import { ReplyArrowIcon } from '../../../components/icons/ReplyArrowIcon'
import { useConfirm } from '../../modal/useConfirm'
import { AttachmentsList } from '../AttachmentsList'
import { deleteAnswerRequest, fetchAttachmentsRequest, NoteScope } from '../api'
import { Answer } from '../discussions.types'
import { EditNoteEntity } from '../form/EditNoteEntity'
import { areAttachmentsEmpty, groupByAttachmentType } from '../helpers'
import { AttachmentsLabel, StyledCommentCard, StyledMarkdown, StyledReplyButton } from '../styles'
import { CardHeader } from './CardHeader'

export function AnswerCard({
  canEdit,
  canReply,
  answer,
  onReply,
  onDelete,
  scope,
}: {
  canEdit: boolean
  canReply: boolean
  answer: Answer
  onReply: () => void
  onDelete: () => void
  scope: NoteScope
}) {
  const [editMode, setEditMode] = useState(false)
  const queryClient = useQueryClient()

  const { data: attachments } = useQuery({
    queryKey: ['attachments', answer.noteId],
    queryFn: () => fetchAttachmentsRequest(answer.noteId),
    select: groupByAttachmentType,
    enabled: !!answer.noteId,
  })

  const deleteMutation = useMutation({
    mutationKey: ['delete-discussion-answer'],
    mutationFn: () => {
      queryClient.invalidateQueries({
        queryKey: ['space'],
      })
      return deleteAnswerRequest(answer.discussionId, answer.id)
    },
    onSuccess: () => {
      if (onDelete) onDelete()
    },
  })
  const { open: openConfirmation, Confirm: ConfirmSubmit } = useConfirm({
    onOk: deleteMutation.mutate,
    okText: 'OK',
    headerText: 'You are about to delete this answer',
    body: (
      <div>
        <p>Are you sure you would like to continue?</p>
      </div>
    ),
  })

  if (editMode) {
    return (
      <StyledMarkdown $isAnswer>
        <EditNoteEntity
          onSuccess={() => setEditMode(false)}
          onCancel={() => setEditMode(false)}
          discussionId={answer.discussionId}
          content={answer.content}
          scope={scope}
          answerId={answer.id}
          noteId={answer.noteId}
        />
      </StyledMarkdown>
    )
  }

  return (
    <StyledCommentCard $isAnswer>
      <CardHeader
        timestamp={answer.createdAt}
        cardType="answer"
        canUserEdit={canEdit}
        user={answer.user}
        onClickEdit={() => setEditMode(true)}
        onClickDelete={openConfirmation}
      />
      <StyledMarkdown>
        <Markdown data={answer.content} />
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
