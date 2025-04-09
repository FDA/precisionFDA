import { useQueryClient } from '@tanstack/react-query'
import React, { useEffect, useRef, useState } from 'react'
import { CommentCard } from './card/CommentCard'
import { Answer } from './discussions.types'
import { CreateCommentEntity } from './form/CreateCommentEntity'
import { StyledCardList } from './styles'
import { AnswerCard } from './card/AnswerCard'
import { NoteScope } from './api'
import { toast } from 'react-toastify'

export const DiscussionAnswer = ({
  canEdit,
  canReply,
  answer,
  currentUserId,
  isLead,
  scope,
}: {
  canEdit: boolean
  canReply: boolean
  answer: Answer
  currentUserId: number
  isLead: boolean
  scope: NoteScope
}) => {
  const queryClient = useQueryClient()

  const handleDelete = () => {
    queryClient.invalidateQueries({
      queryKey: ['discussion'],
    })
    toast.success('Answer successfully removed')
  }

  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
    }
  }, [inputRef, isEditing])

  return (
    <>
      <AnswerCard
        canEdit={canEdit}
        canReply={canReply}
        answer={answer}
        scope={scope}
        onReply={() => {
          inputRef.current?.focus()
          setIsEditing(true)
        }}
        onDelete={handleDelete}
      />
      <StyledCardList>
        {answer.comments &&
          answer.comments.map(comment => (
            <CommentCard
              key={comment.id}
              canUserEdit={currentUserId === comment.user.id || isLead}
              comment={comment}
              answerId={answer.id}
              discussionId={answer.discussionId}
            />
          ))}
        {isEditing && (
          <CreateCommentEntity
            canUserAnswer
            scope={scope}
            onSuccess={() => setIsEditing(false)}
            answerId={answer.id}
            onCancel={() => setIsEditing(false)}
            markdownInputRef={inputRef}
            discussionId={answer.discussionId}
          />
        )}
      </StyledCardList>
    </>
  )
}
