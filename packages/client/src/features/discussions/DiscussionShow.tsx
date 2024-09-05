import { useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { TransparentButton } from '../../components/Button'
import { BackLink } from '../../components/Page/PageBackLink'
import { PencilIcon } from '../../components/icons/PencilIcon'
import { pluralize } from '../../utils/formatting'
import { useAuthUser } from '../auth/useAuthUser'
import { HomeLoader, NotFound } from '../home/show.styles'
import { ISpace } from '../spaces/spaces.types'
import { DiscussionAnswer } from './DiscussionAnswer'
import { fetchDiscussionRequest } from './api'
import { CommentCard } from './card/CommentCard'
import { NoteCard } from './card/NoteCard'
import { CreateCommentEntity } from './form/CreateCommentEntity'
import { EditDiscussionTitle } from './form/EditDiscussionTitle'
import { CommentCount, DiscussionTitle, PageContent, StyledCardList, StyledTitle, UsernameLink } from './styles'

export const DiscussionShow = ({ space }: { space: ISpace }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const markdownInputRef = useRef<HTMLInputElement | null>(null)
  const { discussionId: discussionIdParam } = useParams<{ discussionId: string }>()
  const discussionId = parseInt(discussionIdParam, 10)

  const location = useLocation()
  const user = useAuthUser()

  const { data: discussion, isLoading } = useQuery({
    queryKey: ['discussion', { id: discussionId }],
    queryFn: () => fetchDiscussionRequest(discussionId),
  })

  const handleSuccess = () => {
    if (markdownInputRef.current) {
      markdownInputRef.current.value = ''
    }
  }
  const handleDeleteDiscussion = () => {
    queryClient.invalidateQueries({
      queryKey: ['space'],
    })
    queryClient.invalidateQueries({
      queryKey: ['discussions'],
    })
    navigate(`/spaces/${space.id}/discussions`)
  }

  if (isLoading) {
    return <HomeLoader />
  }

  if (!discussion)
    return (
      <NotFound>
        <h1>Discussion not found</h1>
        <div>Sorry, this discussion does not exist or is not accessible by you.</div>
      </NotFound>
    )

  const backPath = location.pathname.replace(`/${discussionId}`, '')
  const canReply = space.current_user_membership.role !== 'viewer'
  const isLead = space.current_user_membership.role === 'lead'
  const canUserEdit = (noteUserId: number) => user?.id === noteUserId || isLead
  const canUserAnswer = !discussion.answers.map(a => a.note.user.id).includes(user!.id)

  return (
    <PageContent>
      <BackLink linkTo={backPath}>Back to Discussions</BackLink>
      <DiscussionTitle>
        {isEditing ? (
          <EditDiscussionTitle discussionId={discussionId} defaultValue={discussion.note.title} setIsEditing={setIsEditing} />
        ) : (
          <StyledTitle>
            {discussion.note.title}
            {canUserEdit(discussion.note.user.id) && (
              <TransparentButton onClick={() => setIsEditing(true)}>
                <PencilIcon height={16} />
              </TransparentButton>
            )}
          </StyledTitle>
        )}
      </DiscussionTitle>
      <div>
        <UsernameLink href={`/users/${discussion.user.dxuser}`}>{discussion.user.fullName}</UsernameLink> started this discussion
      </div>
      <NoteCard
        canEdit={canUserEdit(discussion.note.user.id)}
        canReply={canReply}
        discussionId={discussion.id}
        note={discussion.note}
        onReply={() => markdownInputRef?.current?.focus()}
        onDelete={handleDeleteDiscussion}
      />
      <StyledCardList>
        <CommentCount>
          {discussion.comments.length} {pluralize('Comment', discussion.comments.length)} and {discussion.answers.length}{' '}
          {pluralize('Answer', discussion.answers.length)}
        </CommentCount>
        {discussion.answers.length > 0 && (
          <>
            {discussion.answers.map(answer => (
              <DiscussionAnswer
                canEdit={canUserEdit(answer.note.user.id)}
                canReply={canReply}
                key={answer.id}
                currentUserId={user!.id}
                answer={answer}
                isLead={isLead}
              />
            ))}
            <hr />
          </>
        )}
        {discussion.comments &&
          discussion.comments.map(comment => (
            <CommentCard
              key={comment.id}
              canUserEdit={canUserEdit(comment.user.id)}
              comment={comment}
              discussionId={discussion.id}
            />
          ))}
        {canReply && (
          <CreateCommentEntity
            canUserAnswer={canUserAnswer}
            onSuccess={handleSuccess}
            onCancel={() => setIsEditing(false)}
            markdownInputRef={markdownInputRef}
            discussionId={discussionId}
            scope={discussion.note.scope}
          />
        )}
      </StyledCardList>
    </PageContent>
  )
}
