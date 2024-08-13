import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { Button } from '../../components/Button'
import { Loader } from '../../components/Loader'
import { PlusIcon } from '../../components/icons/PlusIcon'
import { ErrorBoundary } from '../../utils/ErrorBoundry'
import { pluralize } from '../../utils/formatting'
import { QuickActions, SpaceTitle } from '../home/home.styles'
import { ISpace } from '../spaces/spaces.types'
import { fetchDiscussionsRequest } from './api'
import { formatDiscussionDate } from './helpers'
import { UsernameLink } from './styles'

const DiscussionsActionRow = styled.div`
  display: flex;
  gap: 16px;
  max-width: 856px;
  flex: 1;
  width: 100%;
`

const StyledListPage = styled.div`
  display: flex;
  flex-direction: column;
  padding: 32px;
  gap: 32px;
`

const StyledDiscussionLink = styled(Link)`
  font-size: 16px;
  font-weight: bold;
  line-height: 20px;
  width: fit-content;
`
const Info = styled.div`
  font-size: 12px;
  padding: 4px 0;
`
const DiscussionListItem = styled.div`
  align-self: stretch;
  border-bottom: 1px solid var(--c-layout-border);
  display: flex;
  justify-content: space-between;
  flex: 1;
  padding: 16px 0;
`
const DiscussionTable = styled.div`
  max-width: 856px;
  flex: 1;
  width: 100%;
`
const Left = styled.div``
const Right = styled.div`
  font-size: 14px;
  align-self: flex-end;
`

export const DiscussionList = ({ space, scope }: { space: ISpace; scope: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['discussions', scope],
    queryFn: () => fetchDiscussionsRequest(scope),
  })
  const location = useLocation()

  const membershipType = space.current_user_membership
  const canCreateDiscussion = membershipType.role !== 'viewer' && !space.restricted_discussions

  return (
    <ErrorBoundary>
      <StyledListPage>
        <DiscussionsActionRow>
          <SpaceTitle>Space Discussions</SpaceTitle>
          <QuickActions>
            {canCreateDiscussion && (
              <Button
                data-variant="primary"
                data-turbolinks="false"
                data-testid="space-discussion-create-link"
                as={Link}
                to={`${location.pathname}/create`}
              >
                <PlusIcon height={12} /> Start a Discussion
              </Button>
            )}
          </QuickActions>
        </DiscussionsActionRow>
        {isLoading && (
          <div>
            <Loader />
          </div>
        )}
        <DiscussionTable>
          {data &&
            data
              .slice()
              .reverse()
              .map(discussion => (
                <DiscussionListItem key={discussion.id}>
                  <Left>
                    <StyledDiscussionLink to={`${location.pathname}/${discussion.id}`}>
                      {discussion.note.title}
                    </StyledDiscussionLink>
                    <Info>
                      Started by <UsernameLink href={`/users/${discussion.user.dxuser}`}>{discussion.user.fullName}</UsernameLink>{' '}
                      on {formatDiscussionDate(discussion.createdAt)}
                    </Info>
                  </Left>
                  <Right>
                    {discussion.commentsCount} {pluralize('Comment', discussion.commentsCount)} and {discussion.answersCount}{' '}
                    {pluralize('Answer', discussion.answersCount)}
                  </Right>
                </DiscussionListItem>
              ))}
          {data?.length === 0 && 'No one has started a discussion yet.'}
        </DiscussionTable>
      </StyledListPage>
    </ErrorBoundary>
  )
}
