import { ColumnDefResolved, RowSelectionState } from '@tanstack/react-table'
import React, { DragEvent, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import { Button } from '../../components/Button'
import { HoverDNAnexusLogo } from '../../components/icons/DNAnexusLogo'
import { ContentFooter } from '../../components/Page/ContentFooter'
import { compactScrollBarV2, PageTitle } from '../../components/Page/styles'
import { Pagination } from '../../components/Pagination'
import Table from '../../components/Table'
import { useColumnWidthLocalStorage } from '../../hooks/useColumnWidthLocalStorage'
import { useHiddenColumnLocalStorage } from '../../hooks/useHiddenColumnLocalStorage'
import { useOrderByParams } from '../../hooks/useOrderByState'
import { usePaginationParams } from '../../hooks/usePaginationState'
import { UserLayout } from '../../layouts/UserLayout'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '../../utils/object'
import { createLocationKey } from '../../utils'
import { useAuthUser } from '../auth/useAuthUser'
import { QuickActions } from '../home/home.styles'
import { Action } from '../home/action-types'
import { useFilterParams } from '../home/useFilterState'
import { useListQuery } from '../home/useListQuery'
import { FetchSpacesListResponse, spacesListRequest } from './spaces.api'
import { columnFilters, ISpaceV2 } from './spaces.types'
import { useSpaceHiddenMutation } from './useSpaceHiddenMutation'
import { useSpacesColumns } from './useSpacesColumns'
import { ResouceQueryErrorMessage } from '../home/ResouceQueryErrorMessage'
import { useListSelect } from '../home/useListSelect'
import { spaceGroupsListRequest } from '../space-groups/spaceGroups.api'
import { useQuery } from '@tanstack/react-query'
import { useRemoveFromSpaceGroupMutation } from './useRemoveFromSpaceGroupMutation'
import { DropdownNext } from '../../components/Dropdown/DropdownNext'
import { ActionsDropdownContent } from '../home/ActionDropdownContent'
import { ActionsButton, HomeLoader } from '../home/show.styles'
import { useDeleteSpaceGroupModal } from '../space-groups/useDeleteSpaceGroupModal'
import SpaceGroupsSidebar from './SpaceGroupsSidebar'
import { useAddSpacesToSpaceGroup } from '../space-groups/useAddSpacesToSpaceGroup'
import { ISpaceGroup } from '../space-groups/spaceGroups.types'

const SpacesHeader = styled.div`
  display: flex;
  padding: 24px 20px;
  justify-content: space-between;
`
const SpaceGroupHeading = styled.h4`
  font-weight: 700;
  opacity: 0.5;
`

const SpacesQuickActions = styled(QuickActions)`
  align-items: center;
`

const Layout = styled.div`
  display: flex;
  height: 100vh;
  background: var(--tertiary-50);
  font-family: sans-serif;
  overflow: auto;
  flex-grow: 1;
`

const MainContent = styled.div`
  flex: 1;
  margin: 0 0 0 1rem;
  overflow-x: auto;
  height: 100%;
`

export const SpaceGroupDescrip = styled.div`
  font-size: 14px;
  color: var(--c-text-500);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: 650px;
`

const StyledTable = styled.div`
  font-size: 14px;
  flex-grow: 1;

  ${compactScrollBarV2}
`

const truncateText = (text: string, maxLength = 50) => {
  return text.length <= maxLength ? text : text.slice(0, maxLength).trim() + '…'
}

const createDragImage = (isValidDnD: boolean, spacesCount?: number, spaceName?: string) => {
  const dragImage = document.createElement('div')

  dragImage.style.position = 'absolute'
  dragImage.style.top = '-1000px'
  dragImage.style.left = '-1000px'
  dragImage.style.pointerEvents = 'none'
  dragImage.style.fontFamily = 'sans-serif'

  const color = isValidDnD ? 'black' : 'var(--warning-700)'
  const background = isValidDnD ? 'var(--tertiary-30)' : 'var(--warning-100)'
  const border = isValidDnD ? 'var(--tertiary-400)' : 'var(--warning-300)'

  let content = ''
  if (!isValidDnD) {
    content = '❌ Only government, group and review spaces can be added in a space group'
  } else if (spacesCount === 1 && spaceName) {
    content = `<span style="font-weight: bold;">${spaceName}</span> space selected`
  } else if (spacesCount && spacesCount > 1) {
    content = `<span style="font-weight: bold;">${spacesCount}</span> spaces selected`
  }

  dragImage.innerHTML = `
    <div style="height: 15px;"></div> <!-- vertical spacer -->
    <div style="display: flex;">
      <div style="width: 15px;"></div> <!-- horizontal spacer -->
      <div style="
        padding: 8px 12px;
        background: ${background};
        color: ${color};
        font-weight: ${isValidDnD ? 'normal' : 'bold'};
        border: 1px solid ${border};
        border-radius: 4px;
      ">
      ${content}
      </div>
    </div>
  `

  document.body.appendChild(dragImage)
  return dragImage
}

// Function for spaces dragging into group space
// Only groups, review and government spaces can be added in a group space
// If no space is selected using checkbox, than only dragged row is about to be added
// If there are spaces selected, the dragging has to start with one of the selected rows
const dragSelectedSpacesInSpaceGroup = (
  ev: DragEvent,
  selectedIndexes: RowSelectionState,
  allSpaces: ISpaceV2[],
  setIsValidDragging: (isValid: boolean) => void,
) => {
  const target = ev.target as HTMLElement | null
  const match = target?.id?.match(/\d+/)
  const rowSpaceId = match ? Number(match[0]) : null

  let selectedSpaces: ISpaceV2[]
  if (!selectedIndexes || Object.keys(selectedIndexes).length === 0) {
    selectedSpaces = [allSpaces.find(space => space.id === rowSpaceId)] as unknown as ISpaceV2[]
  } else {
    selectedSpaces = getSelectedObjectsFromIndexes(selectedIndexes, allSpaces) as unknown as ISpaceV2[]
  }

  const selectedSpacesIds = selectedSpaces.map(s => s.id)

  // Drag prevented: Initiating row is not checked.
  if (!rowSpaceId || !selectedSpacesIds.includes(rowSpaceId)) {
    ev.preventDefault()
    return
  }

  const selectedSpacesValid = !selectedSpaces.find(space => !['groups', 'review', 'government'].includes(space.type as string))
  if (selectedSpacesValid) {
    ev.dataTransfer.setData('text/plain', JSON.stringify(selectedSpacesIds))
    setIsValidDragging(true)
  } else {
    setIsValidDragging(false)
  }

  // Custom drag image
  const dragImage = createDragImage(selectedSpacesValid, selectedSpacesIds.length, truncateText(selectedSpaces[0].name, 20))
  ev.dataTransfer.setDragImage(dragImage, -20, 0)

  // Remove drag image after short delay to avoid memory leak
  setTimeout(() => document.body.removeChild(dragImage), 0)
}

const SpacesList = () => {
  const resource = 'spaces'
  const locationKey = createLocationKey(resource)
  const user = useAuthUser()
  const pagination = usePaginationParams()
  const { selectedIndexes, setSelectedIndexes } = useListSelect()
  const { sortBy, sort, setSortBy } = useOrderByParams({
    onSetSortBy: () => setSelectedIndexes({}),
  })
  const { colWidths, saveColumnResizeWidth } = useColumnWidthLocalStorage(locationKey)
  const { columnVisibility, setColumnVisibility } = useHiddenColumnLocalStorage(locationKey)
  const { filterQuery, setSearchFilter } = useFilterParams({
    filters: { ...columnFilters, spaceGroupId: 'number' },
    onSetFilter: () => {
      setSelectedIndexes({})
      pagination.setPageParam(1, 'replaceIn')
    },
  })
  const query = useListQuery<FetchSpacesListResponse>({
    fetchList: spacesListRequest,
    resource: resource,
    pagination: {
      page: pagination.pageParam,
      perPage: pagination.perPageParam,
    },
    sort,
    filter: filterQuery,
  })

  const { isLoading, data, error } = query
  const meta = data?.meta
  const userCanAdministerSite = !!user?.can_administer_site
  const spaceHiddenMutation = useSpaceHiddenMutation()
  const hideSpaces = () => {
    const spaces = getSelectedObjectsFromIndexes(selectedIndexes, data?.data) as unknown as ISpaceV2[]
    const ids = spaces.map(s => s.id)
    spaceHiddenMutation.mutateAsync({ ids, hidden: true })
    setSelectedIndexes({})
  }

  // Space groups stuff
  const navigate = useNavigate()
  const [showTable, setShowTable] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const spaceGroupIdString = searchParams.get('spaceGroupId')
  const spaceGroupId = spaceGroupIdString ? parseInt(spaceGroupIdString) : undefined
  // For adding to the space group via dropdown (at least one space has to be selected)
  const [isSelectionValidForAddingToGroup, setIsSelectionValidForAddingToGroup] = useState<boolean>(false)
  // For adding to the space group via drag & drop (no space needs to be selected)
  const [isValidDragging, setIsValidDragging] = useState<boolean>(false)
  const addSpacesToSpaceGroup = useAddSpacesToSpaceGroup()
  const userCanAdministerSpaceGroups = !!user?.can_administer_site || !!user?.review_space_admin

  useEffect(() => {
    const selectedSpaces = getSelectedObjectsFromIndexes(selectedIndexes, data?.data) as unknown as ISpaceV2[]
    const invalidSpace = selectedSpaces.find(space => !['groups', 'review', 'government'].includes(space.type as string))

    setIsSelectionValidForAddingToGroup(selectedSpaces.length > 0 && !invalidSpace)
  }, [selectedIndexes])

  const querySpaceGroups = useQuery({
    queryKey: ['space-group-list'],
    queryFn: () => spaceGroupsListRequest(),
  })

  const isSpaceGroupsLoading = querySpaceGroups.isLoading
  const spaceGroups = querySpaceGroups.data
  const errorSpaceGroups = querySpaceGroups.error

  const [spaceGroup, setSpaceGroup] = useState<ISpaceGroup>()

  useEffect(() => {
    if (spaceGroupId && spaceGroups) {
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.set('spaceGroupId', spaceGroupId.toString())
      setSearchParams(newParams)
      setSpaceGroup(spaceGroups?.find(sg => sg.id === spaceGroupId))
    } else {
      setSpaceGroup(undefined)
    }
  }, [spaceGroupId, spaceGroups, setSearchFilter])

  const removeFromSpaceGroupMutation = useRemoveFromSpaceGroupMutation()
  const removeFromSpaceGroup = () => {
    const spaces = getSelectedObjectsFromIndexes(selectedIndexes, data?.data) as unknown as ISpaceV2[]
    const spaceIds = spaces.map(s => s.id)
    if (spaceGroupId) {
      removeFromSpaceGroupMutation.mutateAsync({ spaceGroupId, spaceIds })
      setSelectedIndexes({})
    }
  }

  // @ts-expect-error: type is broken from react-table library
  const spacesColumns = useSpacesColumns().filter((c: ColumnDefResolved<ISpaceV2>) => {
    return (
      userCanAdministerSite ||
      (userCanAdministerSpaceGroups && c.accessorKey !== 'hidden') ||
      (c.accessorKey !== 'hidden' && c.id !== 'select')
    )
  })

  const sidebarRef = useRef<{ toggleSpaceGroup: (id: number, forceOpen?: boolean) => void }>(null)

  const getDropdownOptions = (): Action[] => {
    if (!spaceGroups) {
      return []
    }
    return spaceGroups.map(sg => ({
      name: `ID: ${sg.id} - ${sg.name}`,
      isDisabled: false,
      type: 'modal' as const,
      func: async () => {
        const selectedSpaces = getSelectedObjectsFromIndexes(selectedIndexes, data?.data) as unknown as ISpaceV2[]
        const selectedSpacesIds = selectedSpaces.map(s => s.id)
        addSpacesToSpaceGroup(sg.id, selectedSpacesIds).then(() => sidebarRef.current?.toggleSpaceGroup(sg.id, true))
      },
    }))
  }

  const deleteSpaceGroupAction = useDeleteSpaceGroupModal({ spaceGroup })

  // This is to force-reset the table component to forget the filters
  const resetTable = () => {
    setShowTable(false)
    requestAnimationFrame(() => setShowTable(true))
  }

  const backToSpaces = () => {
    resetTable()
    navigate('/spaces')
  }

  // This could possibly happen if you access Space Group directly via URL
  if (spaceGroupId && isSpaceGroupsLoading) {
    return <HomeLoader />
  }

  if (error || errorSpaceGroups) return <ResouceQueryErrorMessage />

  return (
    <UserLayout innerScroll>
      <SpacesHeader>
        <div>
          {spaceGroup && <SpaceGroupHeading>Space Group</SpaceGroupHeading>}
          <PageTitle>{spaceGroup ? spaceGroup.name : 'Spaces'}</PageTitle>
          {spaceGroup && spaceGroup.description && <SpaceGroupDescrip>{spaceGroup.description}</SpaceGroupDescrip>}
        </div>
        <SpacesQuickActions>
          {userCanAdministerSite && (
            <Button data-variant="primary" disabled={Object.keys(selectedIndexes || {}).length === 0} onClick={hideSpaces}>
              Hide Spaces
            </Button>
          )}
          {userCanAdministerSpaceGroups && (
            <>
              {!spaceGroup && (
                <>
                  <DropdownNext trigger="click" content={() => <ActionsDropdownContent actions={getDropdownOptions()} />}>
                    {dropdownProps => (
                      <ActionsButton
                        disabled={!isSelectionValidForAddingToGroup}
                        {...dropdownProps}
                        active={dropdownProps.$isActive}
                        label="Add to Space Group"
                        data-testid="space-list-assign-to-group-button"
                      />
                    )}
                  </DropdownNext>
                  <Button data-variant="primary" as={Link} to="/spaces/new-space-group">
                    Create Space Group
                  </Button>
                </>
              )}
              {spaceGroup && (
                <>
                  <Button
                    data-variant="primary"
                    disabled={Object.keys(selectedIndexes || {}).length === 0}
                    onClick={removeFromSpaceGroup}
                  >
                    Remove from space group
                  </Button>
                  <Button data-variant="primary" onClick={() => deleteSpaceGroupAction?.setShowModal(true)}>
                    Delete space group
                  </Button>
                  <Button data-variant="primary" as={Link} to={`/spaces/edit-space-group/${spaceGroup.id}`}>
                    Edit space group
                  </Button>
                </>
              )}
            </>
          )}
          {spaceGroupId && (
            <Button data-variant="primary" onClick={backToSpaces}>
              Back to Spaces
            </Button>
          )}
          {!spaceGroupId && (
            <Button data-variant="primary" as={Link} to="/spaces/new">
              Create Space
            </Button>
          )}
        </SpacesQuickActions>
      </SpacesHeader>
      <Layout>
        <SpaceGroupsSidebar
          ref={sidebarRef}
          spaceGroups={spaceGroups}
          isLoading={isSpaceGroupsLoading}
          isValidDragging={isValidDragging}
          spaceGroupId={spaceGroupId}
          resetSpacesTable={resetTable}
        />

        <MainContent>
          <StyledTable>
            {showTable && (
              <Table<ISpaceV2>
                isLoading={isLoading}
                data={data?.data || []}
                columns={spacesColumns}
                columnSizing={colWidths}
                setColumnSizing={saveColumnResizeWidth}
                rowSelection={selectedIndexes ?? {}}
                setSelectedRows={setSelectedIndexes}
                setColumnFilters={setSearchFilter}
                columnSortBy={sortBy}
                setColumnSortBy={setSortBy}
                columnFilters={toArrayFromObject(filterQuery)}
                columnVisibility={columnVisibility}
                setColumnVisibility={setColumnVisibility}
                enableHtmlDnd={!spaceGroupId && userCanAdministerSpaceGroups}
                emptyText="No spaces available."
                onDragStart={(ev: DragEvent) =>
                  dragSelectedSpacesInSpaceGroup(ev, selectedIndexes, data?.data ? data?.data : [], setIsValidDragging)
                }
              />
            )}
          </StyledTable>
        </MainContent>
      </Layout>

      <ContentFooter>
        <Pagination
          page={meta?.page}
          totalCount={meta?.total}
          totalPages={meta?.totalPages}
          perPage={pagination.perPageParam}
          isHidden={false}
          setPage={p => pagination.setPageParam(p, 'replaceIn')}
          onPerPageSelect={p => pagination.setPerPageParam(p, 'replaceIn')}
        />
        <HoverDNAnexusLogo opacity height={14} />
      </ContentFooter>
      {deleteSpaceGroupAction?.modalComp}
    </UserLayout>
  )
}

export default SpacesList
