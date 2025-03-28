import React, { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import styled from 'styled-components'
import { RadioButtonGroup } from '../../../components/form/RadioButtonGroup'
import { InputText } from '../../../components/InputText'
import { Loader } from '../../../components/Loader'
import { NoContent } from '../../../components/Public/styles'
import { ErrorBoundary } from '../../../utils/ErrorBoundry'
import { AlertText } from '../../data-portals/details/DataPortalNotFound'
import { SearchBar } from '../../resources/styles'
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
  gap: 16px;
`

const SearchWrapper = styled.div`
  display: flex;
  align-items: flex-start;
`

const StyledMemberList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding-left: 0;
  align-items: flex-start;
  align-self: stretch;
`

const StyledMemberToolRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
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
  const [searchQuery, setSearchQuery] = useState('')
  const { modalComp, setShowModal } = useAddMembersModal({ spaceId: space.id })

  useEffect(() => {
    setSideRole(undefined)
  }, [space.id])

  const { data, isLoading } = useQuery({
    queryKey: ['space-members', space.id, sideRole],
    queryFn: () => spacesMembersListRequest({ spaceId: space.id, sideRole }),
  })

  const members = data?.space_memberships || []
  const canAddMember = space.type !== 'private_type' && space.type !== 'administrator'
  const isPrivateArea = Boolean(space.shared_space_id)
  const currentUserSide = space.current_user_membership.side
  const sideText = currentUserSide === 'host' ? 'Review' : 'Sponsor'

  // Filter members based on the search query
  const filteredMembers = members.filter(member =>
    Object.entries(member)
      .filter(([key, value]) => key !== 'to_roles' && value !== null && value !== undefined) // Exclude 'to_roles' and null/undefined values
      .some(([, value]) => value.toString().toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <ErrorBoundary>
      <StyledMemberListPage>
        <StyledButtonGroup>
          <SpaceTitle>
            {isPrivateArea ? sideText : 'Shared Area'}
            &nbsp;Space Members
          </SpaceTitle>
          <StyledMemberToolRow>
            {space.type === 'review' && !isPrivateArea && (
              <RadioButtonGroup
                options={[
                  { value: undefined, label: '--' },
                  { value: 'reviewer', label: 'Reviewer' },
                  { value: 'sponsor', label: 'Sponsor' },
                ]}
                onChange={setSideRole}
                ariaLabel="Members option filter"
              />
            )}

            {space.updatable && canAddMember && (
              <AddButton data-variant="primary" onClick={() => setShowModal(true)}>
                <PlusIcon height={12} /> Add Members
              </AddButton>
            )}
            <SearchWrapper>
              <SearchBar>
                <InputText placeholder="Search members..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                <Button onClick={() => setSearchQuery('')}>Clear</Button>
              </SearchBar>
            </SearchWrapper>
          </StyledMemberToolRow>
        </StyledButtonGroup>

        {isLoading && <Loader />}
        {!isLoading && filteredMembers.length === 0 && (
          <NoContent>
            <AlertText>No members found</AlertText>
          </NoContent>
        )}
        {!isLoading && filteredMembers.length > 0 && (
          <StyledMemberList>
            {filteredMembers.map(member => (
              <MemberCard key={member.id} member={member} space={space} />
            ))}
          </StyledMemberList>
        )}
      </StyledMemberListPage>
      {modalComp}
    </ErrorBoundary>
  )
}
