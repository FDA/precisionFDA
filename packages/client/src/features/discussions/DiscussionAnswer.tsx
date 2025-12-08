import React, { useEffect, useRef, useState } from 'react'
import { NoteScope } from './api'
import { ReplyCard } from './card/ReplyCard'
import { Answer } from './discussions.types'
import { CreateCommentEntity } from './form/CreateCommentEntity'
import { StyledCardList } from './styles'

export const DiscussionAnswer = ({
  canEdit,
  canReply,
  answer,
  currentUserId,
  isLead = false,
  scope,
}: {
  canEdit: boolean
  canReply: boolean
  answer: Answer
  currentUserId?: number
  isLead: boolean
  scope: NoteScope
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
    }
  }, [inputRef, isEditing])

  return (
    <>
      <ReplyCard
        canEdit={canEdit}
        canReply={canReply}
        reply={answer}
        replyType="answer"
        scope={scope}
        onReply={() => {
          inputRef.current?.focus()
          setIsEditing(true)
        }}
      />
      <StyledCardList>
        {answer.comments &&
          answer.comments.map(comment => (
            <ReplyCard
              key={comment.id}
              canEdit={currentUserId === comment.user.id || isLead}
              canReply={false}
              reply={comment}
              scope={scope}
              replyType="comment"
              onReply={() => {
                inputRef.current?.focus()
                setIsEditing(true)
              }}
            />
          ))}
        {isEditing && (
          <CreateCommentEntity
            canUserAnswer
            scope={scope}
            onSuccess={() => setIsEditing(false)}
            answerId={answer.id}
            onCancel={() => setIsEditing(false)}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            markdownInputRef={inputRef as any}
            discussionId={answer.discussionId}
          />
        )}
      </StyledCardList>
    </>
  )
}
