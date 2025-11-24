import {
  ColumnDefResolved,
  ColumnFiltersState,
  ColumnSizingState,
  ColumnSort,
  RowSelectionState,
  VisibilityState,
} from '@tanstack/react-table'
import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/Button'
import { ActionsMenu } from '../../components/Menu'
import { ContentFooter } from '../../components/Page/ContentFooter'
import { Pagination } from '../../components/Pagination'
import Table from '../../components/Table'
import { StyledPageTable } from '../../components/Table/components/styles'
import { CubeIcon } from '../../components/icons/CubeIcon'
import { HoverDNAnexusLogo } from '../../components/icons/DNAnexusLogo'
import { PlusIcon } from '../../components/icons/PlusIcon'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '../../utils/object'
import { useAuthUser } from '../auth/useAuthUser'
import { ActionsMenuContent } from '../home/ActionMenuContent'
import { ActionModalsRenderer } from '../home/ActionModalsRenderer'
import { ResouceQueryErrorMessage } from '../home/ResouceQueryErrorMessage'
import { ActionsRow, QuickActions } from '../home/home.styles'
import { ResourceHeader } from '../home/show.styles'
import { HomeScope, IMeta } from '../home/types'
import { useList } from '../home/useList'
import { usePropertiesQuery } from '../home/usePropertiesQuery'
import { fetchApps } from './apps.api'
import { IApp } from './apps.types'
import { useAppListActions } from './useAppListActions'
import { useAppSelectionActions } from './useAppSelectionActions'
import { useAppsColumns } from './useAppsColumns'

type ListType = { apps: IApp[]; meta: IMeta }

export const AppList = ({
  homeScope,
  spaceId,
  isContributorOrHigher,
}: {
  homeScope?: HomeScope
  spaceId?: string
  isContributorOrHigher?: boolean
}) => {
  const user = useAuthUser()
  const isAdmin = user?.isAdmin || false
  const {
    setPerPageParam,
    setPageParam,
    setSearchFilter,
    filterQuery,
    perPageParam,
    sortBy,
    setSortBy,
    query,
    selectedIndexes,
    setSelectedIndexes,
    saveColumnResizeWidth,
    colWidths,
    resetSelected,
    setColumnVisibility,
    columnVisibility,
  } = useList<ListType>({
    fetchList: fetchApps,
    resource: 'apps',
    params: {
      spaceId: spaceId || undefined,
      scope: homeScope || undefined,
    },
  })
  const { data: propertiesData } = usePropertiesQuery('appSeries', homeScope, spaceId)

  const { isLoading, data, error } = query

  const selectedAppObjects = getSelectedObjectsFromIndexes(selectedIndexes, data?.apps)

  const { actions, modals } = useAppSelectionActions({
    homeScope,
    spaceId,
    selectedItems: selectedAppObjects,
    resourceKeys: ['apps'],
    resetSelected,
    comparatorLinks: {},
    challenges: data?.meta?.challenges || undefined,
    isContributorOrHigher,
  })

  const { actions: listActions, modals: listModals } = useAppListActions({
    spaceId: spaceId?.toString() || '',
  })

  if (error) return <ResouceQueryErrorMessage />

  return (
    <>
      <ResourceHeader>
        <ActionsRow>
          <QuickActions>
            {homeScope === 'me' && (
              <Button
                data-variant="primary"
                as={Link}
                to="/home/apps/create"
                data-turbolinks="false"
                data-testid="home-apps-create-button"
              >
                <CubeIcon height={14} /> Create App
              </Button>
            )}
            {spaceId && isContributorOrHigher && (
              <Button
                data-variant="primary"
                data-testid="spaces-apps-add-app-button"
                onClick={() => {
                  const action = listActions.find(a => a.name === 'Add App')
                  if (action && 'func' in action) {
                    ;(action.func as () => void)()
                  }
                }}
              >
                <PlusIcon height={12} /> Add App
              </Button>
            )}
          </QuickActions>
          <ActionsMenu data-testid="home-apps-actions-button">
            <ActionsMenuContent
              actions={actions}
              message={homeScope === 'spaces' ? 'To perform other actions on this app, access it from the Space' : undefined}
            />
          </ActionsMenu>
        </ActionsRow>
      </ResourceHeader>
      <AppsListTable
        isAdmin={isAdmin}
        homeScope={homeScope}
        setFilters={setSearchFilter}
        filters={toArrayFromObject(filterQuery).filter(i => i.value !== undefined)}
        apps={data?.apps}
        properties={propertiesData?.keys}
        isLoading={isLoading}
        sortBy={sortBy}
        setSortBy={setSortBy}
        selectedRows={selectedIndexes}
        setSelectedRows={setSelectedIndexes}
        setColumnSizing={saveColumnResizeWidth}
        columnSizing={colWidths}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
      />

      <ContentFooter>
        <Pagination
          page={data?.meta?.pagination?.current_page}
          totalCount={data?.meta?.pagination?.total_count}
          totalPages={data?.meta?.pagination?.total_pages}
          perPage={perPageParam}
          isHidden={false}
          setPage={p => setPageParam(p, 'replaceIn')}
          onPerPageSelect={p => setPerPageParam(p, 'replaceIn')}
        />
        <HoverDNAnexusLogo opacity height={14} />
      </ContentFooter>

      <ActionModalsRenderer modals={modals} />
      <ActionModalsRenderer modals={listModals} />
    </>
  )
}

export const AppsListTable = ({
  isAdmin,
  filters,
  setFilters,
  apps,
  properties,
  // handleRowClick,
  isLoading,
  selectedRows,
  setSelectedRows,
  sortBy,
  setSortBy,
  homeScope,
  columnSizing,
  setColumnSizing,
  columnVisibility,
  setColumnVisibility,
}: {
  isAdmin: boolean
  filters: ColumnFiltersState
  setFilters: (val: ColumnFiltersState) => void
  sortBy: ColumnSort[]
  setSortBy: (cols: ColumnSort[]) => void
  apps?: IApp[]
  properties?: string[]
  // handleRowClick: (_fileId: string) => void
  selectedRows?: RowSelectionState
  setSelectedRows: (ids: RowSelectionState) => void
  isLoading: boolean
  homeScope?: HomeScope
  columnSizing: ColumnSizingState
  setColumnSizing: (columnResizing: ColumnSizingState) => void
  setColumnVisibility: (cols: VisibilityState) => void
  columnVisibility: VisibilityState
}) => {
  function filterColsByScope(c: ColumnDefResolved<IApp>) {
    // Check if any of the conditions is true, then hide the column
    return !(
      // If the homeScope is 'me', hide 'added_by' regardless of other conditions.
      (
        (homeScope === 'me' && c.accessorKey === 'added_by') ||
        // Hide 'location' for all homeScopes except 'spaces'.
        (homeScope !== 'spaces' && c.accessorKey === 'location') ||
        // Hide 'featured' for all homeScopes except 'everybody'.
        (homeScope !== 'everybody' && c.accessorKey === 'featured') ||
        // Hide 'explorers', 'org', 'run_by_you' if homeScope is defined to something specific.
        (homeScope !== undefined && c.accessorKey === 'explorers') ||
        (homeScope !== undefined && c.accessorKey === 'org') ||
        (homeScope !== undefined && c.accessorKey === 'run_by_you')
      )
    )
  }

  // @ts-expect-error filter
  const col = useAppsColumns({ isAdmin, properties }).filter(filterColsByScope)

  return (
    <StyledPageTable>
      <Table<IApp>
        isLoading={isLoading}
        data={apps || []}
        columns={col}
        columnSizing={columnSizing}
        setColumnSizing={setColumnSizing}
        rowSelection={selectedRows ?? {}}
        setSelectedRows={setSelectedRows}
        setColumnFilters={setFilters}
        columnSortBy={sortBy}
        setColumnSortBy={setSortBy}
        columnFilters={filters}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        emptyText="You don't have any apps yet."
      />
    </StyledPageTable>
  )
}
