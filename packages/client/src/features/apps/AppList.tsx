import React, { useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Column, SortingRule, UseResizeColumnsState } from 'react-table'
import Dropdown from '../../components/Dropdown'
import { ContentFooter } from '../../components/Page/ContentFooter'
import { Pagination } from '../../components/Pagination'
import Table from '../../components/Table/Table'
import { EmptyTable } from '../../components/Table/styles'
import { HoverDNAnexusLogo } from '../../components/icons/DNAnexusLogo'
import { PlusIcon } from '../../components/icons/PlusIcon'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '../../utils/object'
import { useAuthUser } from '../auth/useAuthUser'
import { ActionsDropdownContent } from '../home/ActionDropdownContent'
import { ActionsRow, QuickActions, StyledHomeTable } from '../home/home.styles'
import { ActionsButton, ResourceHeader } from '../home/show.styles'
import { IFilter, IMeta, KeyVal, HomeScope } from '../home/types'
import { useList } from '../home/useList'
import { usePropertiesQuery } from '../home/usePropertiesQuery'
import { fetchApps } from './apps.api'
import { IApp } from './apps.types'
import { useAppListActions } from './useAppListActions'
import { useAppSelectionActions } from './useAppSelectionActions'
import { useAppsColumns } from './useAppsColumns'
import { Button } from '../../components/Button'

type ListType = { apps: IApp[]; meta: IMeta }

export const AppList = ({ homeScope, spaceId }: { homeScope?: HomeScope, spaceId?: string }) => {
  const navigate = useNavigate()
  const user = useAuthUser()
  const isAdmin = user?.isAdmin

  const onRowClick = (id: string) => navigate(`/home/apps/${id}`)
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
    saveHiddenColumns,
    hiddenColumns,
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

  const selectedAppObjects = getSelectedObjectsFromIndexes(
    selectedIndexes,
    data?.apps,
  )
  const actions = useAppSelectionActions({
    homeScope,
    spaceId,
    selectedItems: selectedAppObjects,
    resourceKeys: ['apps'],
    resetSelected,
    comparatorLinks: {},
    challenges: data?.meta?.challenges,
  })

  const listActions = useAppListActions({
    spaceId,
    resourceKeys: ['apps'],
  })

  if(homeScope) {
    delete actions['Copy to My Home (private)']
  } else {
    // Disable actions in spaces
    delete actions['Make public']
  }

  if (error) return <div>Error! {JSON.stringify(error)}</div>

  return (
    <>
      <ResourceHeader>
        <ActionsRow>
          <QuickActions>
            {homeScope === 'me' && (
              <Button
                data-variant='primary'
                as={Link}
                to="/home/apps/create"
                data-turbolinks="false"
                data-testid="home-apps-create-button"
              >
                <PlusIcon height={12} /> Create App
              </Button>
            )}
            {spaceId && (
              <Button
                data-variant='primary'
                data-testid="spaces-apps-add-app-button"
                onClick={() =>
                  listActions['Add App']?.func({ showModal: true })
                }
              >
                <PlusIcon height={12} /> Add App
              </Button>
            )}
          </QuickActions>
          <Dropdown
            trigger="click"
            content={
              <ActionsDropdownContent
                actions={actions}
                message={
                  homeScope === 'spaces' &&
                  'To perform other actions on this app, access it from the Space'
                }
              />
            }
          >
            {dropdownProps => (
              <ActionsButton
                {...dropdownProps}
                data-testid="home-apps-actions-button"
                active={dropdownProps.isActive}
              />
            )}
          </Dropdown>
        </ActionsRow>
      </ResourceHeader>

      <AppsListTable
        isAdmin={isAdmin}
        homeScope={homeScope}
        setFilters={setSearchFilter}
        // TODO(samuel) Typescript fix
        filters={toArrayFromObject(filterQuery as any)}
        apps={data?.apps}
        properties={propertiesData?.keys}
        isLoading={isLoading}
        sortBy={sortBy}
        setSortBy={setSortBy}
        handleRowClick={onRowClick}
        selectedRows={selectedIndexes}
        setSelectedRows={setSelectedIndexes}
        saveColumnResizeWidth={saveColumnResizeWidth}
        colWidths={colWidths}
        saveHiddenColumns={saveHiddenColumns}
        hiddenColumns={hiddenColumns}
      />

        <ContentFooter>
          <Pagination
            page={data?.meta?.pagination?.current_page}
            totalCount={data?.meta?.pagination?.total_count}
            totalPages={data?.meta?.pagination?.total_pages}
            perPage={perPageParam}
            isHidden={false}
            isPreviousData={data?.meta?.pagination?.prev_page !== null}
            isNextData={data?.meta?.pagination?.next_page !== null}
            setPage={p => setPageParam(p, 'replaceIn')}
            onPerPageSelect={p => setPerPageParam(p, 'replaceIn')}
          />
        <HoverDNAnexusLogo opacity height={14} />
      </ContentFooter>

      {actions['Delete']?.modal}
      {actions['Copy to space']?.modal}
      {actions['Attach to...']?.modal}
      {actions['Edit tags']?.modal}
      {actions['Edit properties']?.modal}
      {actions['Export to']?.modal}
      {actions['Set as Challenge App']?.modal}
      {actions['Copy to My Home (private)']?.modal}
      
      {listActions['Add App']?.modal}
    </>
  )
}

export const AppsListTable = ({
  isAdmin,
  filters,
  apps,
  properties,
  handleRowClick,
  isLoading,
  setFilters,
  selectedRows,
  setSelectedRows,
  sortBy,
  setSortBy,
  homeScope,
  saveColumnResizeWidth,
  colWidths,
  saveHiddenColumns,
  hiddenColumns,
}: {
  isAdmin: boolean
  filters: IFilter[]
  apps?: IApp[]
  properties?: string[]
  handleRowClick: (fileId: string) => void
  setFilters: (val: IFilter[]) => void
  selectedRows?: Record<string, boolean>
  setSelectedRows: (ids: Record<string, boolean>) => void
  sortBy: SortingRule<string>[]
  setSortBy: (cols: SortingRule<string>[]) => void
  isLoading: boolean
  homeScope?: HomeScope
  colWidths: KeyVal
  saveColumnResizeWidth: (
    columnResizing: UseResizeColumnsState<any>['columnResizing'],
  ) => void
  saveHiddenColumns: (cols: string[]) => void
  hiddenColumns: string[]
}) => {
  const location = useLocation()

  function filterColsByScope(c: Column<IApp>): boolean {
    // Check if any of the conditions is true, then hide the column
    return !(
      // If the homeScope is 'me', hide 'added_by' regardless of other conditions.
      (homeScope === 'me' && c.accessor === 'added_by') ||
      
      // Hide 'location' for all homeScopes except 'spaces'.
      (homeScope !== 'spaces' && c.accessor === 'location') ||
      
      // Hide 'featured' for all homeScopes except 'everybody'.
      (homeScope !== 'everybody' && c.accessor === 'featured') ||
      
      // Hide 'explorers', 'org', 'run_by_you' if homeScope is defined to something specific.
      (homeScope !== undefined && c.accessor === 'explorers') ||
      (homeScope !== undefined && c.accessor === 'org') ||
      (homeScope !== undefined && c.accessor === 'run_by_you')
    )
  }

  const col = useAppsColumns({ colWidths, isAdmin, properties }).filter(filterColsByScope)

  const columns = useMemo(() => col, [col, location.search, properties])
  const data = useMemo(() => apps || [], [apps])

  return (
    <StyledHomeTable>
      <Table<IApp>
        name="apps"
        columns={columns}
        enableColumnSelect
        hiddenColumns={hiddenColumns}
        saveHiddenColumns={saveHiddenColumns}
        data={data}
        properties={properties}
        isSelectable
        isSortable
        isFilterable
        loading={isLoading}
        loadingComponent={<div>Loading...</div>}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        sortByPreference={sortBy}
        setSortByPreference={setSortBy}
        manualFilters
        shouldResetFilters={[homeScope]}
        filters={filters}
        setFilters={setFilters}
        emptyComponent={<EmptyTable>You have no apps here.</EmptyTable>}
        isColsResizable
        saveColumnResizeWidth={saveColumnResizeWidth}
      />
    </StyledHomeTable>
  )
}
