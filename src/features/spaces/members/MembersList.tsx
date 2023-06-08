import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import styled from 'styled-components'
import { ButtonSolidBlue } from '../../../components/Button'
import { RadioButtonGroup } from '../../../components/form/RadioButtonGroup'
import { Loader } from '../../../components/Loader'
import { ErrorBoundary } from '../../../utils/ErrorBoundry'
import { ISpace, SideRole } from '../spaces.types'
import { MemberCard } from './MemberCard'
import { spacesMembersListRequest } from './members.api'
import { useAddMembersModal } from './useAddMembersModal'

export const StyledTitle = styled.h1`
  margin: 0;
  margin-bottom: 32px;
`

export const StyledMemberListPage = styled.div`
  padding: 32px;
`
export const StyledMemberList = styled.div`
  gap: 10px;
  display: flex;
  flex-wrap: wrap;
`

export const StyledButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 32px 0;
`

export const MembersList = ({ space }: { space: ISpace }) => {
  const [sideRole, setSideRole] = useState<SideRole | undefined>()
  const { data, status } = useQuery(['space-members', space.id, sideRole], () =>
    spacesMembersListRequest({ spaceId: space.id, sideRole }),
  )
  const { modalComp, setShowModal } = useAddMembersModal({ spaceId: space.id })
  const members = data?.space_memberships
  const canAddMember =
    space.type !== 'private_type' && space.type !== 'administrator'

  return (
    <ErrorBoundary>
      <StyledMemberListPage>
        <StyledTitle>Shared Area Members</StyledTitle>
        <StyledButtonGroup>
          {space.type === 'review' && (
            <RadioButtonGroup
              options={[
                { value: undefined, label: 'All' },
                { value: 'reviewer', label: 'Reviewer' },
                { value: 'sponsor', label: 'Sponsor' },
              ]}
              onChange={setSideRole}
              ariaLabel="Members option filter"
            />
          )}

          {space.updatable && canAddMember && (
            <ButtonSolidBlue onClick={() => setShowModal(true)}>
              Add Members
            </ButtonSolidBlue>
          )}
        </StyledButtonGroup>

        {status === 'loading' && (
          <div>
            <div>Loading members...</div>
            <Loader />
          </div>
        )}
        <StyledMemberList>
          {members &&
            members.map(member => (
              <MemberCard key={member.id} member={member} spaceId={space.id} />
            ))}
        </StyledMemberList>
      </StyledMemberListPage>
      {modalComp}
    </ErrorBoundary>
  )
}
