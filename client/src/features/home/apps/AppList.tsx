import { omit } from 'ramda'
import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { SortingRule, UseResizeColumnsState } from 'react-table'
import { ButtonSolidBlue } from '../../../components/Button'
import Dropdown from '../../../components/Dropdown'
import { PlusIcon } from '../../../components/icons/PlusIcon'
import { hidePagination, Pagination } from '../../../components/Pagination'
import { EmptyTable } from '../../../components/Table/styles'
import Table from '../../../components/Table/Table'
import { ActionsDropdownContent } from '../ActionDropdownContent'
import { ActionsRow, QuickActions, StyledHomeTable } from '../home.styles'
import { ActionsButton } from '../show.styles'
import { IFilter, IMeta, KeyVal, ResourceScope } from '../types'
import { useList } from '../useList'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '../utils'
import { fetchApps } from './apps.api'
import { IApp } from './apps.types'
import { useAppsColumns } from './useAppsColumns'
import { useAppSelectionActions } from './useAppSelectionActions'

type ListType = { apps: IApp[]; meta: IMeta }

export const AppList = ({ scope, spaceId }: { scope?: ResourceScope, spaceId?: string }) => {
  const history = useHistory()
  const isAdmin = useSelector((state: any) => state.context.user.admin)
  const onRowClick = (id: string) => history.push(`/home/apps/${id}`)
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
  } = useList<ListType>({
    fetchList: fetchApps,
    onRowClick,
    resource: 'apps',
    scope,
    spaceId,
  })

  const { status, data, error } = query

  const selectedFileObjects = getSelectedObjectsFromIndexes(
    selectedIndexes,
    data?.apps,
  )
  const actions = useAppSelectionActions({
    scope,
    selectedItems: selectedFileObjects,
    resourceKeys: ['apps'],
    resetSelected,
    comparatorLinks: {}
  })

  if (status === 'error') return <div>Error! {JSON.stringify(error)}</div>

  return (
    <>
      <div>
        <ActionsRow>
          <QuickActions>
            {scope === 'me' && (
              <>
                <ButtonSolidBlue
                  as="a"
                  href="/apps/new"
                  data-testid="home-apps-create-button"
                >
                  <PlusIcon height={12} /> Create App
                </ButtonSolidBlue>
              </>
            )}
          </QuickActions>
          <Dropdown
            trigger="click"
            content={
              <ActionsDropdownContent
                actions={omit(['Comments'], actions)}
                message={
                  scope === 'spaces' &&
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
      </div>

      <AppsListTable
        isAdmin={isAdmin}
        scope={scope}
        setFilters={setSearchFilter}
        filters={toArrayFromObject(filterQuery)}
        apps={data?.apps}
        isLoading={status === 'loading'}
        sortBy={sortBy}
        setSortBy={setSortBy}
        handleRowClick={onRowClick}
        selectedRows={selectedIndexes}
        setSelectedRows={setSelectedIndexes}
        saveColumnResizeWidth={saveColumnResizeWidth}
        colWidths={colWidths}
      />

      <Pagination
        page={data?.meta?.pagination?.current_page!}
        totalCount={data?.meta?.pagination?.total_count!}
        totalPages={data?.meta?.pagination?.total_pages!}
        perPage={perPageParam}
        hide={hidePagination(
          query.isFetched,
          data?.apps?.length,
          data?.meta?.pagination?.total_pages,
        )}
        isPreviousData={data?.meta?.pagination?.prev_page! !== null}
        isNextData={data?.meta?.pagination?.next_page! !== null}
        setPage={setPageParam}
        onPerPageSelect={setPerPageParam}
      />

      {actions['Delete']?.modal}
      {actions['Copy to space']?.modal}
      {actions['Attach to...']?.modal}
      {actions['Edit tags']?.modal}
      {actions['Export to']?.modal}
      {actions['Set as Challenge App']?.modal}
    </>
  )
}

export const AppsListTable = ({
  isAdmin,
  filters,
  apps,
  handleRowClick,
  isLoading,
  setFilters,
  selectedRows,
  setSelectedRows,
  sortBy,
  setSortBy,
  scope,
  saveColumnResizeWidth,
  colWidths,
}: {
  isAdmin: boolean
  filters: IFilter[]
  apps?: IApp[]
  handleRowClick: (fileId: string) => void
  setFilters: (val: IFilter[]) => void
  selectedRows?: Record<string, boolean>
  setSelectedRows: (ids: Record<string, boolean>) => void
  sortBy: SortingRule<string>[]
  setSortBy: (cols: SortingRule<string>[]) => void
  isLoading: boolean
  scope?: ResourceScope
  colWidths: KeyVal
  saveColumnResizeWidth: (
    columnResizing: UseResizeColumnsState<any>['columnResizing'],
  ) => void
}) => {

  const featuredColumnHide = scope !== 'everybody' ? 'featured' : null
  const locationColumnHide = scope !== 'spaces' ? 'location' : null
  const addedByColumnHide = scope === 'me' ? 'added_by' : null

  const hidden = [
    featuredColumnHide,
    locationColumnHide,
    addedByColumnHide,
  ].filter(Boolean) as string[]

  const col = useAppsColumns({ colWidths, isAdmin })
  const [hiddenColumns, sethiddenColumns] = useState<string[]>(hidden)

  useEffect(() => {
    sethiddenColumns(hidden)
  }, [scope])

  const columns = useMemo(() => col, [col])

  const data = useMemo(() => apps || [], [apps])

  return (
    <StyledHomeTable>
      <Table<IApp>
        name="apps"
        columns={columns}
        hiddenColumns={hiddenColumns}
        data={data}
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
        filters={filters}
        setFilters={setFilters}
        emptyComponent={<EmptyTable>You have no apps here.</EmptyTable>}
        isColsResizable
        saveColumnResizeWidth={saveColumnResizeWidth}
      />
    </StyledHomeTable>
  )
}
