import { useDroppable } from '@dnd-kit/core'
import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { Button, IconButton, TransparentButton } from '../../components/Button'
import { DropdownNext } from '../../components/Dropdown/DropdownNext'
import { CaretUpIcon } from '../../components/icons/CaretUpIcon'
import { EllipsisVerticalIcon } from '../../components/icons/EllipsisVerticalIcon'
import { PlusIcon } from '../../components/icons/PlusIcon'
import { ActionsDropdownContent } from '../home/ActionDropdownContent'
import { ActionModalsRenderer } from '../home/ActionModalsRenderer'
import { useCreateSpaceGroupModal } from '../space-groups/modals/useCreateSpaceGroupModal'
import { ISpaceGroup, ISpaceGroupSpace } from '../space-groups/types'
import { useSpaceGroupSelectActions } from '../space-groups/useSpaceGroupSelectActions'
import { truncateText } from './helpers'
import { findSpaceTypeIcon } from './useSpacesColumns'

const SidebarContainer = styled.div`
  background: var(--tertiary-50);
  border-right: 1px solid var(--c-layout-border);
  min-width: 256px;
  max-width: 256px;
  width: 256px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;
`

const SpaceGroupItemWrapper = styled.div`
  width: 100%;
  height: 100%;
  max-height: 100%;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-gutter: stable;
  scrollbar-color: var(--c-scrollbar) transparent;
`

const SpaceGroupItem = styled.div<{ $isActive?: boolean; $isHighlighted?: boolean }>`
  background-color: transparent;
  transition: background-color 0.2s ease;
  cursor: pointer;
  border-radius: 2px;
  &:hover {
    background-color: var(--tertiary-100);
  }
  ${({ $isActive }) =>
    $isActive &&
    css`
      background-color: var(--tertiary-100);
    `}
  ${({ $isHighlighted }) =>
    $isHighlighted &&
    css`
      background-color: var(--primary-50);
    `}
`

const SpaceGroupHeading = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  padding: 12px;
  color: var(--c-text-700);
  h2 {
    font-weight: 600;
    position: relative;
    margin-right: auto;
  }
  span {
    display: inline-flex;
    font-size: 12px;
    font-weight: 400;
    padding: 2px 6px;
    background: var(--tertiary-200);
    border-radius: 4px;
    color: var(--c-text-500);
    margin-left: auto;
  }
`

const CaretButton = styled(TransparentButton)`
  transition: transform 0.2s ease;

  &[data-expanded='true'] {
    transform: rotate(180deg);
  }

  &[data-expanded='false'] {
    transform: rotate(90deg);
  }
`

const SpaceList = styled.ul`
  list-style: none;
  padding-left: 2rem;
  padding-bottom: 1rem;
`

const SpaceItem = styled.li`
  padding: 0.25rem 0;

  a {
    color: var(--c-text-700);
    text-decoration: none;
    font-size: 0.9rem;

    &:hover {
      text-decoration: underline;
    }
  }
`

const SpaceLink = styled.div<{ $isDisabled?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--c-text-700);
  text-decoration: none;
  font-size: 0.9rem;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }

  ${({ $isDisabled }) =>
    $isDisabled &&
    `
    color: var(--c-text-400) !important;
    cursor: not-allowed;
    user-select: none;

    &:hover {
      text-decoration: none !important;
    }

    svg {
      opacity: 0.5;
    }`}
`

const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  min-width: 15px;
  svg {
    width: 1em;
    height: 1em;
  }
`

const SpaceGroupsMessage = styled.div`
  color: var(--c-text-500);
  font-style: italic;
  font-size: 0.9rem;
  padding: 1rem 0;
  text-align: center;
`

const SpaceGroupTitle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  font-weight: bold;
  text-transform: uppercase;
  padding: 16px 12px;
  color: var(--c-text-500);

  button {
    width: fit-content;
    min-width: fit-content;
    padding: 6px 12px;
    gap: 4px;
  }
`

type Props = {
  spaceGroups?: ISpaceGroup[]
  isLoading: boolean
  userCanAdministerSpaceGroups: boolean
}

const SpaceGroupItemRender = ({
  spaceGroup,
  userCanAdministerSpaceGroups,
}: {
  spaceGroup: ISpaceGroup
  userCanAdministerSpaceGroups: boolean
}) => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const spaceGroupId = searchParams.get('spaceGroupId')
  const [spaceGroupExpanded, setSpaceGroupExpanded] = useState<boolean>(spaceGroup.spaces?.length > 0)
  const truncateThreshold = userCanAdministerSpaceGroups ? 16 : 20
  const { setNodeRef, isOver } = useDroppable({
    id: spaceGroup.id,
    data: { name: spaceGroup.name },
    disabled: spaceGroup.id === parseInt(spaceGroupId || '0'),
  })

  useEffect(() => {
    if (spaceGroup.id === parseInt(spaceGroupId || '0')) {
      setSpaceGroupExpanded(true)
    }
  }, [spaceGroupId, spaceGroup.id])

  const handleSpaceGroupClick = (groupId: number) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('spaceGroupId', groupId.toString())
    setSearchParams(newParams)
    setSpaceGroupExpanded(true)
  }

  const handleExpandSpaceGroup = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSpaceGroupExpanded(!spaceGroupExpanded)
  }

  const handleRedirectToSpace = (e: React.MouseEvent, spaceId: number) => {
    e.preventDefault()
    e.stopPropagation()
    navigate(`/spaces/${spaceId}`)
  }

  const { actions, modals } = useSpaceGroupSelectActions({ spaceGroup })

  return (
    <SpaceGroupItem
      $isHighlighted={isOver}
      $isActive={spaceGroup.id === parseInt(spaceGroupId || '0')}
      ref={setNodeRef}
      key={spaceGroup.id}
      onClick={() => handleSpaceGroupClick(spaceGroup.id)}
    >
      <SpaceGroupHeading>
        <CaretButton data-expanded={spaceGroupExpanded} onClick={handleExpandSpaceGroup} title="Expand/collapse">
          <CaretUpIcon width={12} />
        </CaretButton>
        <h2 title={spaceGroup.name}>{truncateText(spaceGroup.name, truncateThreshold)}</h2>
        {spaceGroup.spaces?.length > 0 && <span>{spaceGroup.spaces?.length}</span>}
        {userCanAdministerSpaceGroups && (
          <DropdownNext trigger="click" content={() => <ActionsDropdownContent actions={actions} />}>
            {dropdownProps => {
              return (
                // @ts-expect-error ref is not compatible
                <IconButton
                  {...dropdownProps}
                  onClick={e => {
                    e.stopPropagation()
                    dropdownProps.onClick?.(e)
                  }}
                  data-testid={`space-list-assign-to-group-button-${spaceGroup.id}`}
                >
                  <EllipsisVerticalIcon width={16} height={16} />
                </IconButton>
              )
            }}
          </DropdownNext>
        )}
      </SpaceGroupHeading>
      {spaceGroupExpanded && spaceGroup.spaces?.length === 0 && <SpaceGroupsMessage>No spaces in this group</SpaceGroupsMessage>}
      {spaceGroupExpanded && spaceGroup.spaces?.length > 0 && (
        <SpaceList>
          {spaceGroup.spaces.map((space: ISpaceGroupSpace) => (
            <SpaceItem key={space.id}>
              <SpaceLink onClick={e => handleRedirectToSpace(e, space.id)} $isDisabled={!space.isActiveMember}>
                <IconWrapper>{findSpaceTypeIcon(space.type)}</IconWrapper>
                <span>{truncateText(space.name, 20)}</span>
              </SpaceLink>
            </SpaceItem>
          ))}
        </SpaceList>
      )}
      <ActionModalsRenderer modals={modals} />
    </SpaceGroupItem>
  )
}

const SpaceGroupsSidebar = ({ spaceGroups, isLoading, userCanAdministerSpaceGroups }: Props) => {
  const { modalComp: createSpaceGroupModal, setShowModal: setCreateSpaceGroupModal } = useCreateSpaceGroupModal()

  return (
    <>
      <SidebarContainer>
        <SpaceGroupTitle>
          <span>SPACE GROUPS</span>
          {userCanAdministerSpaceGroups && (
            <Button data-variant="primary" onClick={() => setCreateSpaceGroupModal(true)}>
              <PlusIcon width={12} height={12} /> Add
            </Button>
          )}
        </SpaceGroupTitle>
        <SpaceGroupItemWrapper>
          {isLoading && <SpaceGroupsMessage>Loading...</SpaceGroupsMessage>}
          {!isLoading && !spaceGroups?.length && <SpaceGroupsMessage>No Space group available</SpaceGroupsMessage>}
          {!isLoading &&
            spaceGroups?.map(sg => (
              <SpaceGroupItemRender userCanAdministerSpaceGroups={userCanAdministerSpaceGroups} key={sg.id} spaceGroup={sg} />
            ))}
        </SpaceGroupItemWrapper>
      </SidebarContainer>
      {createSpaceGroupModal}
    </>
  )
}

SpaceGroupsSidebar.displayName = 'SpaceGroupsSidebar'

export default SpaceGroupsSidebar
