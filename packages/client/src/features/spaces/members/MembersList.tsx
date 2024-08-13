import React, { useState } from 'react'
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
  const members = data?.space_memberships ?? []
  const canAddMember =
    space.type !== 'private_type' && space.type !== 'administrator'

  const [searchQuery, setSearchQuery] = useState('')

  // Filter members based on the search query
  const filteredMembers = members.filter((member) =>
    Object.entries(member)
      .filter(([key, value]) => key !== 'to_roles' && value !== null && value !== undefined) // Exclude 'to_roles' and null/undefined values
      .some(([key, value]) =>
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
  )

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
            <AddButton data-variant='primary' type="button" onClick={() => setShowModal(true)}>
              <PlusIcon height={12}/>
              Add Members
            </AddButton>
          )}
          <SearchWrapper>
            <SearchBar>
              <InputText placeholder="Search members..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              <Button type="button" onClick={() => setSearchQuery('')}>
                Clear
              </Button>
            </SearchBar>
          </SearchWrapper>
        </StyledButtonGroup>

        {isLoading && (
          <div>
            <div>Loading members...</div>
            <Loader/>
          </div>
        )}

        <StyledMemberList>
          { filteredMembers.length === 0 ?  <NoContent>
            <AlertText>No members found</AlertText>
          </NoContent> :
            filteredMembers.map(member => (
              <MemberCard key={member.id} member={member} spaceId={space.id}/>
            ))}
        </StyledMemberList>
      </StyledMemberListPage>
      {modalComp}
    </ErrorBoundary>
  )
}
