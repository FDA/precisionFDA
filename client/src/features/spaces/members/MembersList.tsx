import React, { useState } from 'react'
import { useQuery } from 'react-query'
import styled from 'styled-components'
import { Button } from '../../../components/Button'
import { ButtonGroup } from '../../../components/Button/ButtonGroup'
import { ErrorBoundary } from '../../../utils/ErrorBoundry'
import { SideRole } from '../spaces.types'
import { MemberCard } from './MemberCard'
import { spacesMembersListRequest } from './members.api'
import { Loader } from '../../../components/Loader'

export const StyledMemberListPage = styled.div`
  padding: 16px;
`
export const StyledMemberList = styled.div`
  gap: 10px;
  display: flex;
  flex-wrap: wrap;
`

export const MembersList = ({ spaceId }: { spaceId: string }) => {
  const [sideRole, setSideRole] = useState<SideRole | undefined>()
  const { data, status } = useQuery(
    ['space-members', spaceId, sideRole],
    () => spacesMembersListRequest({ spaceId, sideRole }),
  )
  const members = data?.space_memberships
  return (
    <ErrorBoundary>
      <StyledMemberListPage>
        <h1>Shared Area Members</h1>
        <ButtonGroup>
          <Button
            onClick={() => setSideRole(undefined)}
            active={sideRole === undefined}
          >
            All
          </Button>
          <Button
            onClick={() => setSideRole('reviewer')}
            active={sideRole === 'reviewer'}
          >
            Reviewer
          </Button>
          <Button
            onClick={() => setSideRole('sponsor')}
            active={sideRole === 'sponsor'}
          >
            Sponsor
          </Button>
        </ButtonGroup>
        {status === 'loading' && <div><div>Loading members...</div><Loader /></div>}
        <StyledMemberList>
          {members &&
            members.map(member => (
              <MemberCard key={member.id} member={member} />
            ))}
        </StyledMemberList>
      </StyledMemberListPage>
    </ErrorBoundary>
  )
}
