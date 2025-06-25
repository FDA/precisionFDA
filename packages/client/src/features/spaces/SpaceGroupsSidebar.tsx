import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react'
import styled from 'styled-components'
import { Link, useSearchParams } from 'react-router-dom'
import { findSpaceTypeIcon } from './useSpacesColumns'
import { ISpaceGroup, ISpaceGroupSpace } from '../space-groups/spaceGroups.types'
import { useAddSpacesToSpaceGroup } from '../space-groups/useAddSpacesToSpaceGroup'
import { CaretUpIcon } from '../../components/icons/CaretUpIcon'

const ToggleWrapper = styled.div`
  display: flex;
  align-items: start;
`

const ToggleButton = styled.button`
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  border-color: var(--primary-600);
  background: var(--primary-500);
  color: white;
  border: none;
  padding: 1rem 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  border-radius: 8px 0 0 8px;
  transition: background 0.2s ease;

  &:hover {
    filter: brightness(94%);
  }
`

const SidebarContainer = styled.div`
  background: var(--tertiary-50);
  border-right: 1px solid var(--tertiary-200);
  width: 250px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`

const SpaceGroupItem = styled.div<{ $isHighlighted?: boolean }>`
  border-bottom: 1px solid var(--tertiary-100);
  background-color: ${({ $isHighlighted }) => ($isHighlighted ? 'var(--primary-50)' : 'transparent')};
  transition: background-color 0.2s ease;
  padding: 0 1rem 0 1.5rem;
`

const SpaceGroupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  cursor: pointer;
  padding: 0.7rem 0;
`

const SpaceGroupNameLink = styled.div`
  color: var(--tertiary-800);
  text-decoration: none;
  font-weight: 600;
  max-width: 100%;
  word-break: break-word;
  overflow-wrap: break-word;

  &:hover {
    text-decoration: underline;
  }
`

const Caret = styled.span`
  display: inline-block;
  transition: transform 0.2s ease;
  user-select: none;

  &[data-expanded="true"] {
    transform: rotate(180deg);
  }

  &[data-expanded="false"] {
    transform: rotate(90deg);
  }
`

const SpaceList = styled.ul`
  list-style: none;
  padding-left: 1rem;
  margin: 0 0 1rem;
`

const SpaceItem = styled.li`
  padding: 0.25rem 0;

  a {
    color: var(--tertiary-800);
    text-decoration: none;
    font-size: 0.9rem;

    &:hover {
      text-decoration: underline;
    }
  }
`

const SpaceLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--tertiary-800);
  text-decoration: none;
  font-size: 0.9rem;

  &:hover {
    text-decoration: underline;
  }
`

const DisabledSpaceLink = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--tertiary-400);
  font-size: 0.9rem;
  cursor: not-allowed;
  user-select: none;

  svg {
    opacity: 0.5;
  }
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

const truncateText = (text: string, maxLength = 50) => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '…'
}

type Props = {
  spaceGroups?: ISpaceGroup[]
  isLoading: boolean
  isValidDragging: boolean
  spaceGroupId?: number
  resetSpacesTable: () => void
}

const SpaceGroupsSidebar = forwardRef(({
                              spaceGroups,
                              isLoading,
                              isValidDragging,
                              spaceGroupId,
                              resetSpacesTable,
                            }: Props, ref) => {
  const [dragOverGroupId, setDragOverGroupId] = useState<number | null>(null)
  const [expandedSpaceGroups, setExpandedSpaceGroups] = useState<Record<number, boolean>>({})
  const [searchParams, setSearchParams] = useSearchParams()
  const [spaceGroupsVisible, setSpaceGroupsVisible] = useState(localStorage.getItem('spaceGroupsExpanded') === 'true')
  const addSpacesToSpaceGroup = useAddSpacesToSpaceGroup()

  // Expand all space groups by default when they are loaded
  useEffect(() => {
    if (spaceGroups && spaceGroups.length > 0) {
      const expandedState: Record<number, boolean> = {}
      spaceGroups.forEach(sg => {
        expandedState[sg.id] = true
      })
      setExpandedSpaceGroups(expandedState)
    }
  }, [spaceGroups])

  const showGroupSpaces = (isShown: boolean) => {
    localStorage.setItem('spaceGroupsExpanded', isShown.toString())
    setSpaceGroupsVisible(isShown)
  }

  const toggleSpaceGroup = (id: number, forceOpen: boolean = false) => {
    setExpandedSpaceGroups(prev => ({ ...prev, [id]: forceOpen || !prev[id] }))
  }
  // Expose the internal toggleSpaceGroup method to the parent
  useImperativeHandle(ref, () => ({
    toggleSpaceGroup,
  }))

  const spaceGroupClick = (clickedGroupId: number) => {
    const newParams = new URLSearchParams()
    newParams.set('spaceGroupId', clickedGroupId.toString())
    setSearchParams(newParams)
    resetSpacesTable()
  }

  return (
    <>
      {spaceGroupsVisible && (
        <SidebarContainer>
          {isLoading && (
            <SpaceGroupsMessage>Loading...</SpaceGroupsMessage>
          )}

          {!isLoading && !spaceGroups?.length && (
            <SpaceGroupsMessage>No Space group available</SpaceGroupsMessage>
          )}

          {!isLoading && spaceGroups && spaceGroups.map(sg => (
            <SpaceGroupItem
              key={sg.id}
              onDrop={ev => {
                ev.preventDefault()
                const spaceIdsString = ev.dataTransfer.getData('text')
                const spaceIds: number[] = spaceIdsString ? JSON.parse(spaceIdsString) : []

                if (spaceIds.length) {
                  addSpacesToSpaceGroup(sg.id, spaceIds).then(() => toggleSpaceGroup(sg.id, true))
                }
                setDragOverGroupId(null)
              }}
              onDragOver={ev => {
                ev.preventDefault()
                if (isValidDragging) {
                  setDragOverGroupId(sg.id)
                }
              }}
              onDragLeave={() => {
                setDragOverGroupId(null)
              }}
              $isHighlighted={dragOverGroupId === sg.id || spaceGroupId === sg.id}
            >
              <SpaceGroupHeader>
                <SpaceGroupNameLink onClick={() => spaceGroupClick(sg.id)}>
                  {truncateText(sg.name)}
                </SpaceGroupNameLink>
                <Caret
                  data-expanded={!!expandedSpaceGroups[sg.id]}
                  onClick={() => toggleSpaceGroup(sg.id)}
                  title="Expand/collapse"
                >
                  <CaretUpIcon />
                </Caret>
              </SpaceGroupHeader>

              {expandedSpaceGroups[sg.id] && (
                !sg.spaces?.length ? (
                  <SpaceGroupsMessage>No spaces in this group</SpaceGroupsMessage>
                ) : (
                  <SpaceList>
                    {sg.spaces.map((space: ISpaceGroupSpace) => (
                      <SpaceItem key={space.id}>
                        {space.isActiveMember ? (
                          <SpaceLink to={`/spaces/${space.id}`}>
                            <IconWrapper>{findSpaceTypeIcon(space.type)}</IconWrapper>
                            <span>{space.name}</span>
                          </SpaceLink>
                        ) : (
                          <DisabledSpaceLink>
                            <IconWrapper>{findSpaceTypeIcon(space.type)}</IconWrapper>
                            <span>{space.name}</span>
                          </DisabledSpaceLink>
                        )}
                      </SpaceItem>
                    ))}
                  </SpaceList>
                )
              )}
            </SpaceGroupItem>
          ))}
        </SidebarContainer>
      )}

      <ToggleWrapper>
        <ToggleButton onClick={() => showGroupSpaces(!spaceGroupsVisible)}>
          Space Groups
        </ToggleButton>
      </ToggleWrapper>
    </>
  )
})

SpaceGroupsSidebar.displayName = 'SpaceGroupsSidebar'

export default SpaceGroupsSidebar
