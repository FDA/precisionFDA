import React, { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import styled from 'styled-components'
import { RadioButtonGroup } from '../../../components/form/RadioButtonGroup'
import { ErrorBoundary } from '../../../utils/ErrorBoundry'
import { ISpace, SideRole } from '../spaces.types'
import { spacesMembersListRequest } from './members.api'
import { useAddMembersModal } from './useAddMembersModal'
import { ActionsRow, SpaceTitle } from '../../home/home.styles'
import { PlusIcon } from '../../../components/icons/PlusIcon'
import { Button } from '../../../components/Button'
import { ColumnFiltersState, ColumnSort, RowSelectionState } from '@tanstack/react-table'
import { MembersListTable } from './MembersListTable'
import { DropdownNext } from '../../../components/Dropdown/DropdownNext'
import { ActionsDropdownContent } from '../../home/ActionDropdownContent'
import { ActionsButton } from '../../home/show.styles'
import { useMemberSelectionActions } from './useMemberSelectionActions'
import { useColumnWidthLocalStorage } from '../../../hooks/useColumnWidthLocalStorage'
import { createLocationKey } from '../../../utils'
import { useHiddenColumnLocalStorage } from '../../../hooks/useHiddenColumnLocalStorage'
import { ActionModalsRenderer } from '../../home/ActionModalsRenderer'

const StyledMemberListPage = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  padding: 16px;
  padding-bottom: 0;
`

const AddButton = styled(Button)`
  svg {
    margin-right: 4px;
  }
`

export const MembersList = ({ space }: { space: ISpace }) => {
  const locationKey = createLocationKey('members', space.id)
  const [sideRole, setSideRole] = useState<SideRole | undefined>()
  const { modalComp, setShowModal } = useAddMembersModal({ spaceId: String(space.id) })
  const { columnVisibility, setColumnVisibility } = useHiddenColumnLocalStorage(locationKey)
  const { colWidths, saveColumnResizeWidth } = useColumnWidthLocalStorage(locationKey)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sortBy, setSortBy] = useState<ColumnSort[]>([])
  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({})

  useEffect(() => {
    setSideRole(undefined)
  }, [space.id])

  const { data, isLoading } = useQuery({
    queryKey: ['space-members', space.id, sideRole],
    queryFn: () => spacesMembersListRequest({ spaceId: space.id.toString(), sideRole }),
  })

  const members = data?.space_memberships || []
  const canAddMember = space.type !== 'private_type' && space.type !== 'administrator'
  const isPrivateArea = Boolean(space.shared_space_id)
  const currentUserSide = space.current_user_membership.side
  const isLeadOrAdmin = space.current_user_membership.role === 'admin' || space.current_user_membership.role === 'lead'
  const sideText = currentUserSide === 'host' ? 'Review' : 'Sponsor'
  const selectedMembers = Object.keys(selectedRows)
    .map(index => members[Number(index)])
    .filter(Boolean)

  const { actions, modals } = useMemberSelectionActions({
    space,
    selectedItems: selectedMembers,
    resourceKeys: ['space-members', String(space.id), sideRole || ''],
    resetSelected: () => setSelectedRows({}),
  })

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
          </StyledMemberToolRow>
          {isLeadOrAdmin && (
            <ActionsRow>
              <div />
              <DropdownNext trigger="click" content={() => <ActionsDropdownContent actions={actions} />}>
                {dropdownProps => (
                  <ActionsButton
                    {...dropdownProps}
                    data-testid="members-actions-button"
                    active={dropdownProps.$isActive}
                    disabled={selectedMembers.length === 0}
                  />
                )}
              </DropdownNext>
            </ActionsRow>
          )}
        </StyledButtonGroup>

        <MembersListTable
          space={space}
          members={members}
          isLoading={isLoading}
          filters={columnFilters}
          setFilters={setColumnFilters}
          sortBy={sortBy}
          setSortBy={setSortBy}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          columnSizing={colWidths}
          setColumnSizing={saveColumnResizeWidth}
          columnVisibility={columnVisibility}
          setColumnVisibility={setColumnVisibility}
          isLeadOrAdmin={isLeadOrAdmin}
        />
      </StyledMemberListPage>
      {modalComp}
      <ActionModalsRenderer modals={modals} />
    </ErrorBoundary>
  )
}
