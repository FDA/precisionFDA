import { omit } from 'ramda'
import React, { useEffect, useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { SortingRule, UseResizeColumnsState } from 'react-table'
import { ButtonSolidBlue } from '../../../components/Button'
import Dropdown from '../../../components/Dropdown'
import { PlusIcon } from '../../../components/icons/PlusIcon'
import { hidePagination, Pagination } from '../../../components/Pagination'
import { EmptyTable } from '../../../components/Table/styles'
import Table from '../../../components/Table/Table'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '../../../utils/object'
import { ActionsDropdownContent } from '../ActionDropdownContent'
import { ActionsRow, QuickActions, StyledHomeTable, StyledPaginationSection } from '../home.styles'
import { ActionsButton } from '../show.styles'
import { IFilter, IMeta, KeyVal, ResourceScope } from '../types'
import { useList } from '../useList'
import { fetchApps } from './apps.api'
import { IApp } from './apps.types'
import { useAppListActions } from './useAppListActions'
import { useAppsColumns } from './useAppsColumns'
import { useAppSelectionActions } from './useAppSelectionActions'
import { useAuthUser } from '../../auth/useAuthUser'

type ListType = { apps: IApp[]; meta: IMeta }

export const AppList = ({ scope, spaceId }: { scope?: ResourceScope, spaceId?: string }) => {
  const history = useHistory()
  const user = useAuthUser()
  const isAdmin = user?.isAdmin

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
    resource: 'apps',
    params: {
      spaceId: spaceId || undefined,
      scope: scope || undefined,
    },
  })

  const { status, data, error } = query

  const selectedFileObjects = getSelectedObjectsFromIndexes(
    selectedIndexes,
    data?.apps,
  )
  const actions = useAppSelectionActions({
    scope,
    spaceId,
    selectedItems: selectedFileObjects,
    resourceKeys: ['apps'],
    resetSelected,
    comparatorLinks: {},
    challenges: data?.meta?.challenges,
  })

  const listActions = useAppListActions({
    scope,
    spaceId,
    resourceKeys: ['apps'],
  })

  if(scope) {
    delete actions['Copy to My Home (private)']
  } else {
    // Disable actions in spaces
    delete actions['Make public']
    delete actions['Copy to My Home (private)']
  }

  if (status === 'error') return <div>Error! {JSON.stringify(error)}</div>

  return (
    <>
      <div>
        <ActionsRow>
          <QuickActions>
            {scope === 'me' && (
              <ButtonSolidBlue
                as="a"
                href="/apps/new"
                data-turbolinks="false"
                data-testid="home-apps-create-button"
              >
                <PlusIcon height={12} /> Create App
              </ButtonSolidBlue>
            )}
            {spaceId && (
              <ButtonSolidBlue
                data-testid="spaces-apps-add-app-button"
                onClick={() =>
                  listActions['Add App']?.func({ showModal: true })
                }
              >
                <PlusIcon height={12} /> Add App
              </ButtonSolidBlue>
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
        // TODO(samuel) Typescript fix
        filters={toArrayFromObject(filterQuery as any)}
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
      <StyledPaginationSection>
        <Pagination
          page={data?.meta?.pagination?.current_page}
          totalCount={data?.meta?.pagination?.total_count}
          totalPages={data?.meta?.pagination?.total_pages}
          perPage={perPageParam}
          isHidden={hidePagination(
            query.isFetched,
            data?.apps?.length,
            data?.meta?.pagination?.total_pages,
            )}
            isPreviousData={data?.meta?.pagination?.prev_page !== null}
            isNextData={data?.meta?.pagination?.next_page !== null}
            setPage={setPageParam}
            onPerPageSelect={setPerPageParam}
        />
      </StyledPaginationSection>

      {actions['Delete']?.modal}
      {actions['Copy to space']?.modal}
      {actions['Copy to My Home (private)']?.modal}
      {actions['Attach to...']?.modal}
      {actions['Edit tags']?.modal}
      {actions['Export to']?.modal}
      {actions['Set as Challenge App']?.modal}
      
      {listActions['Add App']?.modal}
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
  const explorersColumnHide = scope !== undefined ? 'explorers' : null
  const orgColumnHide = scope !== undefined ? 'org' : null
  const runByYouColumnHide = scope !== undefined ? 'run_by_you' : null

  const hidden = [
    featuredColumnHide,
    locationColumnHide,
    addedByColumnHide,
    explorersColumnHide,
    orgColumnHide,
    runByYouColumnHide,
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
        shouldResetFilters={[scope]}
        filters={filters}
        setFilters={setFilters}
        emptyComponent={<EmptyTable>You have no apps here.</EmptyTable>}
        isColsResizable
        saveColumnResizeWidth={saveColumnResizeWidth}
      />
    </StyledHomeTable>
  )
}
