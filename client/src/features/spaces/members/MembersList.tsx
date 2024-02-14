import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import styled from 'styled-components'
import { RadioButtonGroup } from '../../../components/form/RadioButtonGroup'
import { Loader } from '../../../components/Loader'
import { ErrorBoundary } from '../../../utils/ErrorBoundry'
import { ISpace, SideRole } from '../spaces.types'
import { MemberCard } from './MemberCard'
import { spacesMembersListRequest } from './members.api'
import { useAddMembersModal } from './useAddMembersModal'
import { SpaceTitle } from '../../home/home.styles'
import { PlusIcon } from '../../../components/icons/PlusIcon'
import { Button } from '../../../components/Button'


const StyledMemberListPage = styled.div`
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 32px;
`
const StyledMemberList = styled.div`
display: flex;
padding-left: 0px;
align-items: flex-start;
gap: 16px;
align-self: stretch;
flex-wrap: wrap;
`

const StyledButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
`

const AddButton = styled(Button)`
  svg {
    margin-right: 4px;
  }
`

export const MembersList = ({ space }: { space: ISpace }) => {
  const [sideRole, setSideRole] = useState<SideRole | undefined>()
  const { data, isLoading } = useQuery({
    queryKey: ['space-members', space.id, sideRole],
    queryFn: () => spacesMembersListRequest({ spaceId: space.id, sideRole }),
  })
  const { modalComp, setShowModal } = useAddMembersModal({ spaceId: space.id })
  const members = data?.space_memberships
  const canAddMember =
    space.type !== 'private_type' && space.type !== 'administrator'

  return (
    <ErrorBoundary>
      <StyledMemberListPage>
        <StyledButtonGroup>
          <SpaceTitle>Shared Area Members</SpaceTitle>
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
            <AddButton variant='primary' type="button" onClick={() => setShowModal(true)}>
              <PlusIcon height={12} />
              Add Members
            </AddButton>
          )}
        </StyledButtonGroup>

        {isLoading && (
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
