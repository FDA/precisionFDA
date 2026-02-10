import React, { useEffect, useMemo, useState } from 'react'
import { DndContext, MouseSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useQuery } from '@tanstack/react-query'
import { ColumnDefResolved } from '@tanstack/react-table'
import { useSearchParams } from 'react-router'
import styled from 'styled-components'
import { BannerTitle, MainBanner } from '../../components/Banner'
import { ContentFooter } from '../../components/Page/ContentFooter'
import { compactScrollBarV2 } from '../../components/Page/styles'
import { Pagination } from '../../components/Pagination'
import Table from '../../components/Table'
import { useColumnWidthLocalStorage } from '../../hooks/useColumnWidthLocalStorage'
import { useHiddenColumnLocalStorage } from '../../hooks/useHiddenColumnLocalStorage'
import { useOrderByParams } from '../../hooks/useOrderByState'
import { usePaginationParams } from '../../hooks/usePaginationState'
import { UserLayout } from '../../layouts/UserLayout'
import { createLocationKey } from '../../utils'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '../../utils/object'
import { useAuthUser } from '../auth/useAuthUser'
import { ResouceQueryErrorMessage } from '../home/ResouceQueryErrorMessage'
import { HomeLoader } from '../home/show.styles'
import { useFilterParams } from '../home/useFilterState'
import { useListQuery } from '../home/useListQuery'
import { useListSelect } from '../home/useListSelect'
import { spaceGroupsListRequest } from '../space-groups/api'
import { ISpaceGroup } from '../space-groups/types'
import SpaceGroupsSidebar from './SpaceGroupsSidebar'
import { SpaceQuickActions } from './SpaceQuickActions'
import { FetchSpacesListResponse, spacesListRequest } from './spaces.api'
import { columnFilters, ISpaceV2 } from './spaces.types'
import { useSpacesColumns } from './useSpacesColumns'
import { useSpaceDnd } from './useSpacesDnd'

const SpacesHeader = styled(MainBanner)`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 24px 32px;
  justify-content: space-between;
  border-bottom: 1px solid var(--c-layout-border);
`

const SpaceGroupHeading = styled.h4`
  font-weight: 700;
  opacity: 0.5;
`

const Layout = styled.div`
  display: flex;
  height: 100vh;
  background: var(--tertiary-50);
  overflow: auto;
  flex-grow: 1;
`

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  overflow-x: auto;
  height: 100%;
`

export const SpaceGroupDescription = styled.div`
  font-size: 14px;
  color: var(--c-banner-base);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: 650px;
  &::first-letter {
    text-transform: uppercase;
  }
`

const StyledTable = styled.div`
  font-size: 14px;
  flex-grow: 1;
  overflow: auto;

  ${compactScrollBarV2}
`

const useQuerySpaceGroups = () => {
  return useQuery({
    queryKey: ['space-group-list'],
    queryFn: () => spaceGroupsListRequest(),
  })
}

const SpacesList = () => {
  const sensors = useSensors(useSensor(MouseSensor, { activationConstraint: { distance: 5 } }))
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
    filters: columnFilters,
  })

  useEffect(() => {
    setSelectedIndexes({})
  }, [JSON.stringify(filterQuery), JSON.stringify(pagination), JSON.stringify(sort), setSelectedIndexes])

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

  // Space groups stuff
  const [spaceGroup, setSpaceGroup] = useState<ISpaceGroup>()
  const [searchParams, setSearchParams] = useSearchParams()
  const spaceGroupIdString = searchParams.get('spaceGroupId')
  const spaceGroupId = spaceGroupIdString ? parseInt(spaceGroupIdString) : undefined
  const userCanAdministerSpaceGroups = !!user?.can_administer_site || !!user?.review_space_admin

  const { data: spaceGroups, isLoading: isSpaceGroupsLoading, error: errorSpaceGroups } = useQuerySpaceGroups()
  const spaceGroupsMemo = useMemo(() => spaceGroups || [], [spaceGroups])
  const selectedObjects = getSelectedObjectsFromIndexes(selectedIndexes, data?.data) || []

  const { handleDragStart, handleDragEnd, dndAddSpacesModal } = useSpaceDnd({
    selectedObjects: selectedObjects,
  })

  useEffect(() => {
    setSelectedIndexes({})
  }, [spaceGroupId])

  useEffect(() => {
    if (spaceGroupId && spaceGroupsMemo) {
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.set('spaceGroupId', spaceGroupId.toString())
      setSearchParams(newParams)
      setSpaceGroup(spaceGroupsMemo?.find(sg => sg.id === spaceGroupId))
    } else {
      setSpaceGroup(undefined)
    }
  }, [spaceGroupId, spaceGroupsMemo, setSearchFilter])

  // @ts-expect-error: type is broken from react-table library
  const spacesColumns = useSpacesColumns().filter((c: ColumnDefResolved<ISpaceV2>) => {
    return (
      userCanAdministerSite ||
      (userCanAdministerSpaceGroups && c.accessorKey !== 'hidden') ||
      (c.accessorKey !== 'hidden' && c.id !== 'select')
    )
  })

  // This could possibly happen if you access Space Group directly via URL
  if (spaceGroupId && isSpaceGroupsLoading) {
    return <HomeLoader />
  }

  if (error || errorSpaceGroups) return <ResouceQueryErrorMessage />

  return (
    <UserLayout innerScroll>
      <SpacesHeader>
        {spaceGroup && <SpaceGroupHeading>Space Group</SpaceGroupHeading>}
        <BannerTitle>{spaceGroup ? spaceGroup.name : 'Spaces'}</BannerTitle>
        {spaceGroup && <SpaceGroupDescription>{spaceGroup.description}</SpaceGroupDescription>}
      </SpacesHeader>
      <Layout>
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} sensors={sensors}>
          <SpaceGroupsSidebar
            userCanAdministerSpaceGroups={userCanAdministerSpaceGroups}
            spaceGroups={spaceGroups}
            isLoading={isSpaceGroupsLoading}
          />
          <MainContent>
            <SpaceQuickActions
              spaceGroupId={spaceGroupId}
              spaceGroup={spaceGroup}
              userCanAdministerSite={userCanAdministerSite}
              userCanAdministerSpaceGroups={userCanAdministerSpaceGroups}
              spaceGroups={spaceGroupsMemo}
              selectedItems={selectedObjects}
            />
            <StyledTable>
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
                enableDnd={userCanAdministerSpaceGroups}
                emptyText="No spaces available."
              />
            </StyledTable>
            <ContentFooter>
              <Pagination
                page={meta?.page}
                totalCount={meta?.total}
                totalPages={meta?.totalPages}
                perPage={pagination.perPageParam}
                isHidden={false}
                setPage={p => pagination.setPageParam(p, true)}
                onPerPageSelect={p => pagination.setPerPageParam(p, true)}
              />
            </ContentFooter>
          </MainContent>
        </DndContext>
      </Layout>
      {dndAddSpacesModal?.modalComp}
    </UserLayout>
  )
}

export default SpacesList
