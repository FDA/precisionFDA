import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { Markdown } from '../../../components/Markdown'
import { ReplyArrowIcon } from '../../../components/icons/ReplyArrowIcon'
import { useConfirm } from '../../modal/useConfirm'
import { AttachmentsList } from '../AttachmentsList'
import { deleteAnswerRequest, deleteDiscussionRequest, fetchAttachmentsRequest } from '../api'
import { Note } from '../discussions.types'
import { EditNoteEntity } from '../form/EditNoteEntity'
import { areAttachmentsEmpty, groupByAttachmentType } from '../helpers'
import { AttachmentsLabel, StyledCommentCard, StyledMarkdown, StyledReplyButton } from '../styles'
import { CardHeader } from './CardHeader'

export function NoteCard({
  canEdit,
  canReply,
  answerId,
  note,
  discussionId,
  onReply,
  onDelete,
}: {
  canEdit: boolean
  canReply: boolean
  answerId?: number
  discussionId: number
  note: Note
  onReply: () => void
  onDelete: () => void
}) {
  const [editMode, setEditMode] = useState(false)
  const queryClient = useQueryClient()

  const { data: attachments } = useQuery({
    queryKey: ['attachments', note.id],
    queryFn: () => fetchAttachmentsRequest(note.id),
    select: groupByAttachmentType,
    enabled: !!note?.id,
  })

  const deleteMutation = useMutation({
    mutationKey: ['delete-answer-discussion'],
    mutationFn: () => {
      queryClient.invalidateQueries({
        queryKey: ['space'],
      })
      if(answerId) {
        return deleteAnswerRequest(discussionId, answerId)
      }
      return deleteDiscussionRequest(discussionId)
    },
    onSuccess: () => {
      if(onDelete) onDelete()
    },
  })
  const { open: openConfirmation, Confirm: ConfirmSubmit } = useConfirm({
    onOk: deleteMutation.mutate,
    okText: 'OK',
    headerText: `You are about to delete this ${note.noteType === 'Answer' ? 'answer' : 'discussion'}.`,
    body: (
      <div>
        <p>Are you sure you would like to continue?</p>
      </div>
    ),
  })

  if (editMode) {
    return (
      <StyledMarkdown $isAnswer={!!answerId}>
        <EditNoteEntity
          onSuccess={() => setEditMode(false)}
          onCancel={() => setEditMode(false)}
          note={note}
          discussionId={discussionId}
          answerId={answerId}
        />
      </StyledMarkdown>
    )
  }

  return (
    <StyledCommentCard $isAnswer={!!answerId}>
      <CardHeader
        timestamp={note.createdAt}
        cardType={answerId ? 'answer' : 'discussion'}
        canUserEdit={canEdit}
        user={note.user}
        onClickEdit={() => setEditMode(true)}
        onClickDelete={openConfirmation}
      />
      <StyledMarkdown>
        <Markdown data={note.content} />
      </StyledMarkdown>
      {attachments && !areAttachmentsEmpty(attachments) && (
        <>
          <AttachmentsLabel>Attachments</AttachmentsLabel>
          <AttachmentsList attachments={attachments} scope={note.scope} />
        </>
      )}
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
