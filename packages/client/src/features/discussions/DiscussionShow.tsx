import { useQueryClient } from '@tanstack/react-query'
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Tooltip } from 'react-tooltip'
import { useToggleFollowDiscussionMutation } from '../../api/mutations/discussion'
import {
  getFetchDiscussionQueryKey,
  useFetchDiscussionAttachmentsQuery,
  useFetchDiscussionQuery,
} from '../../api/queries/discussion'
import { Button } from '../../components/Button'
import { BackLink } from '../../components/Page/PageBackLink'
import { PencilIcon } from '../../components/icons/PencilIcon'
import { pluralize } from '../../utils/formatting'
import { HomeLoader, NotFound } from '../home/show.styles'
import { ISpace } from '../spaces/spaces.types'
import { DiscussionAnswer } from './DiscussionAnswer'
import { DiscussionCard } from './card/DiscussionCard'
import { ReplyCard } from './card/ReplyCard'
import { Attachment } from './discussions.types'
import { CreateCommentEntity } from './form/CreateCommentEntity'
import { EditDiscussionTitle } from './form/EditDiscussionTitle'
import { CommentCount, DiscussionTitle, PageContent, StyledCardList, StyledTitle, UsernameLink } from './styles'
import { defaultHomeContext, HomeScopeContextValue } from '../home/HomeScopeContext'
import { IUser } from '../../types/user'
import { toastSuccess } from '../../components/NotificationCenter/ToastHelper'

interface DiscussionContextType {
  attachments: Record<number, Attachment[]>
}

const getTooltipContent = (following: boolean) => {
  return following
    ? 'Unfollow this discussion to stop receiving email notifications'
    : 'Follow this discussion to receive email notifications when new replies are added'
}

const DiscussionContext = createContext<DiscussionContextType | undefined>(undefined)

export const useDiscussionContext = () => {
  const context = useContext(DiscussionContext)
  if (!context) {
    throw new Error('useDiscussionContext must be used within a DiscussionProvider')
  }
  return context
}

const DiscussionProvider = ({ children, value }: { children: ReactNode; value: DiscussionContextType }) => (
  <DiscussionContext.Provider value={value}>{children}</DiscussionContext.Provider>
)

export const DiscussionShow = ({
  discussionId,
  space,
  user,
  homeContext = defaultHomeContext,
}: {
  discussionId: number
  space?: ISpace
  user: IUser
  homeContext?: HomeScopeContextValue
}) => {
  const { isHome, homeScopeChangeHandler } = homeContext
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const markdownInputRef = useRef<HTMLInputElement | null>(null)

  const { data: discussion, isLoading, error } = useFetchDiscussionQuery(discussionId)

  useEffect(() => {
    if (isHome && discussion) {
      homeScopeChangeHandler(discussion.scope)
    }
  }, [discussion])
  const attachmentsQuery = useFetchDiscussionAttachmentsQuery(discussion!)

  useEffect(() => {
    if (discussion?.id) {
      attachmentsQuery.refetch()
    }
  }, [discussion?.id, discussion?.commentsCount, discussion?.answersCount])

  const attachments = attachmentsQuery.data

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
    toastSuccess('Discussion successfully removed')

    if (space) {
      navigate(`/spaces/${space.id}/discussions`)
    } else {
      navigate('/home/discussions?scope=everybody')
    }
  }

  const { mutate: toggleFollow } = useToggleFollowDiscussionMutation()

  if (isLoading) {
    return <HomeLoader />
  }

  if (!discussion || error)
    return (
      <NotFound>
        <h1>Discussion not found</h1>
        <div>Sorry, this discussion does not exist or is not accessible by you.</div>
      </NotFound>
    )

  const handleToggleFollow = () => {
    toggleFollow(discussion, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getFetchDiscussionQueryKey(discussionId) })
        toastSuccess(`Discussion successfully ${discussion.following ? 'unfollowed' : 'followed'}`)
      },
    })
  }

  const backPath = space ? `/spaces/${space.id}/discussions` : '/home/discussions?scope=everybody'
  const canReply = space?.current_user_membership.role !== 'viewer'
  const isLead = space?.current_user_membership.role === 'lead'
  const canUserEdit = (noteUserId: number) => user?.id === noteUserId || isLead || (user?.can_administer_site ?? false)
  const canUserAnswer = user ? !discussion.answers.map(a => a.user.id).includes(user.id) : false

  return (
    <DiscussionProvider value={{ attachments: attachments || {} }}>
      <PageContent>
        <BackLink linkTo={backPath}>Back to Discussions</BackLink>
        <DiscussionTitle>
          {isEditing ? (
            <EditDiscussionTitle discussionId={discussionId} defaultValue={discussion.title} setIsEditing={setIsEditing} />
          ) : (
            <>
              <StyledTitle>
                <div data-testid="discussion-title">{discussion.title}</div>
                {canUserEdit(discussion.user.id) && (
                  <Button data-testid="discussion-edit-title" data-variant="link" onClick={() => setIsEditing(true)}>
                    <PencilIcon height={16} />
                  </Button>
                )}
              </StyledTitle>
              <Button
                data-variant="primary"
                data-tooltip-id="follow-tooltip"
                data-tooltip-content={getTooltipContent(discussion.following)}
                onClick={handleToggleFollow}
              >
                {discussion.following ? 'Unfollow discussion' : 'Follow discussion'}
              </Button>
              <Tooltip id="follow-tooltip" delayShow={100} />
            </>
          )}
        </DiscussionTitle>
        <div>
          <UsernameLink href={`/users/${discussion.user.dxuser}`}>{discussion.user.fullName}</UsernameLink> started this
          discussion
        </div>
        <DiscussionCard
          canEdit={canUserEdit(discussion.user.id)}
          canReply={canReply}
          discussion={discussion}
          onReply={() => markdownInputRef?.current?.focus()}
          onDelete={handleDeleteDiscussion}
          discussionAttachments={attachments?.[discussion.noteId]}
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
                  canEdit={canUserEdit(answer.user.id)}
                  canReply={canReply}
                  key={answer.id}
                  currentUserId={user!.id}
                  answer={answer}
                  isLead={isLead}
                  scope={discussion.scope}
                />
              ))}
            </>
          )}
          {discussion.comments.length > 0 &&
            discussion.comments.map(comment => (
              <ReplyCard
                key={comment.id}
                canEdit={canUserEdit(comment.user.id)}
                canReply={false}
                reply={comment}
                scope={discussion.scope}
                replyType="comment"
              />
            ))}
          {canReply && (
            <CreateCommentEntity
              canUserAnswer={canUserAnswer}
              onSuccess={handleSuccess}
              onCancel={() => setIsEditing(false)}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              markdownInputRef={markdownInputRef as any}
              discussionId={discussionId}
              scope={discussion.scope}
            />
          )}
        </StyledCardList>
      </PageContent>
    </DiscussionProvider>
  )
}
