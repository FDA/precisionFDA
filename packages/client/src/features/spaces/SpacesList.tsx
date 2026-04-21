import { DndContext, MouseSensor, useSensor, useSensors } from '@dnd-kit/core'
import { type UseQueryResult, useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { BannerTitle, MainBanner } from '@/components/Banner'
import { ContentFooter } from '@/components/Page/ContentFooter'
import { Pagination } from '@/components/Pagination'
import { useColumnWidthLocalStorage } from '@/hooks/useColumnWidthLocalStorage'
import { useHiddenColumnLocalStorage } from '@/hooks/useHiddenColumnLocalStorage'
import { useOrderByParams } from '@/hooks/useOrderByState'
import { usePaginationParams } from '@/hooks/usePaginationState'
import { UserLayout } from '@/layouts/UserLayout'
import { createLocationKey } from '@/utils'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '@/utils/object'
import Table from '../../components/Table'
import { useAuthUser } from '../auth/useAuthUser'
import { ResourceQueryErrorMessage } from '../home/ResourceQueryErrorMessage'
import { HomeLoader } from '../home/show.styles'
import { useFilterParams } from '../home/useFilterState'
import { useListQuery } from '../home/useListQuery'
import { useListSelect } from '../home/useListSelect'
import { spaceGroupsListRequest } from '../space-groups/api'
import type { ISpaceGroup } from '../space-groups/types'
import SpaceGroupsSidebar from './SpaceGroupsSidebar'
import { SpaceQuickActions } from './SpaceQuickActions'
import { type FetchSpacesListResponse, spacesListRequest } from './spaces.api'
import styles from './spaces.module.css'
import { columnFilters, type ISpaceV2 } from './spaces.types'
import { useSpacesColumns } from './useSpacesColumns'
import { useSpaceDnd } from './useSpacesDnd'

const useQuerySpaceGroups = (): UseQueryResult<ISpaceGroup[]> => {
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
  const pagination = usePaginationParams(resource)
  const { selectedIndexes, setSelectedIndexes } = useListSelect()
  const { sortBy, sort, setSortBy } = useOrderByParams({
    onSetSortBy: () => setSelectedIndexes({}),
  })
  const { colWidths, saveColumnResizeWidth } = useColumnWidthLocalStorage(locationKey)
  const { columnVisibility, setColumnVisibility } = useHiddenColumnLocalStorage(locationKey)
  const { filterQuery, setSearchFilter } = useFilterParams({
    filters: columnFilters,
  })
  const selectionResetTrigger = JSON.stringify({
    filterQuery,
    page: pagination.pageParam,
    perPage: pagination.perPageParam,
    sort,
  })

  useEffect(() => {
    if (selectionResetTrigger) {
      setSelectedIndexes({})
    }
  }, [selectionResetTrigger, setSelectedIndexes])

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
  const searchParamsString = searchParams.toString()
  const spaceGroupIdString = searchParams.get('spaceGroupId')
  const spaceGroupId = spaceGroupIdString ? parseInt(spaceGroupIdString, 10) : undefined
  const userCanAdministerSpaceGroups = !!user?.can_administer_site || !!user?.review_space_admin

  const { data: spaceGroups, isLoading: isSpaceGroupsLoading, error: errorSpaceGroups } = useQuerySpaceGroups()
  const spaceGroupsMemo = useMemo(() => spaceGroups || [], [spaceGroups])
  const selectedObjects = getSelectedObjectsFromIndexes(selectedIndexes, data?.data) || []

  const { handleDragStart, handleDragEnd, dndAddSpacesModal } = useSpaceDnd({
    selectedObjects: selectedObjects,
  })

  useEffect(() => {
    if (spaceGroupId === undefined || spaceGroupId > 0) {
      setSelectedIndexes({})
    }
  }, [spaceGroupId, setSelectedIndexes])

  useEffect(() => {
    if (spaceGroupId && spaceGroupsMemo) {
      const newParams = new URLSearchParams(searchParamsString)
      newParams.set('spaceGroupId', spaceGroupId.toString())
      setSearchParams(newParams)
      setSpaceGroup(spaceGroupsMemo?.find(sg => sg.id === spaceGroupId))
    } else {
      setSpaceGroup(undefined)
    }
  }, [searchParamsString, setSearchParams, spaceGroupId, spaceGroupsMemo])

  const spacesColumns = useSpacesColumns().filter((column: ColumnDef<ISpaceV2>) => {
    const isHiddenColumn = 'accessorKey' in column && column.accessorKey === 'hidden'
    const isSelectColumn = 'id' in column && column.id === 'select'

    return userCanAdministerSite || (userCanAdministerSpaceGroups && !isHiddenColumn) || (!isHiddenColumn && !isSelectColumn)
  })

  // This could possibly happen if you access Space Group directly via URL
  if (spaceGroupId && isSpaceGroupsLoading) {
    return <HomeLoader />
  }

  if (error || errorSpaceGroups) return <ResourceQueryErrorMessage />

  return (
    <UserLayout innerScroll>
      <MainBanner className={styles.spacesHeader}>
        {spaceGroup && <h4 className={styles.spaceGroupHeading}>Space Group</h4>}
        <BannerTitle>{spaceGroup ? spaceGroup.name : 'Spaces'}</BannerTitle>
        {spaceGroup && <div className={styles.spaceGroupDescription}>{spaceGroup.description}</div>}
      </MainBanner>
      <div className={styles.spacesLayout}>
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} sensors={sensors}>
          <SpaceGroupsSidebar
            userCanAdministerSpaceGroups={userCanAdministerSpaceGroups}
            spaceGroups={spaceGroups}
            isLoading={isSpaceGroupsLoading}
          />
          <div className={styles.spacesMainContent}>
            <SpaceQuickActions
              spaceGroupId={spaceGroupId}
              spaceGroup={spaceGroup}
              userCanAdministerSite={userCanAdministerSite}
              userCanAdministerSpaceGroups={userCanAdministerSpaceGroups}
              spaceGroups={spaceGroupsMemo}
              selectedItems={selectedObjects}
            />
            <div className={styles.spacesStyledTable}>
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
            </div>
            <ContentFooter>
              <Pagination
                page={meta?.page}
                totalCount={meta?.total}
                totalPages={meta?.totalPages}
                perPage={pagination.perPageParam}
                isHidden={false}
                setPage={(p: number): void => pagination.setPageParam(p, true)}
                onPerPageSelect={(p: number): void => pagination.setPerPageParam(p, true)}
              />
            </ContentFooter>
          </div>
        </DndContext>
      </div>
      {dndAddSpacesModal?.modalComp}
    </UserLayout>
  )
}

export default SpacesList
