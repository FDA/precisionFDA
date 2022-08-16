import React, { useEffect, useMemo, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { SortingRule, UseResizeColumnsState } from 'react-table'
import styled from 'styled-components'
import { ButtonSolidBlue } from '../../../components/Button'
import Dropdown from '../../../components/Dropdown'
import { PlusIcon } from '../../../components/icons/PlusIcon'
import { SyncIcon } from '../../../components/icons/SyncIcon'
import { BackLink } from '../../../components/Page/PageBackLink'
import { Refresh } from '../../../components/Page/styles'
import { hidePagination, Pagination } from '../../../components/Pagination'
import { EmptyTable } from '../../../components/Table/styles'
import Table from '../../../components/Table/Table'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '../../../utils/object'
import { ActionsDropdownContent } from '../ActionDropdownContent'
import {
  ActionsRow,
  QuickActions,
  StyledHomeTable,
  StyledPaginationSection,
  StyledRight,
} from '../home.styles'
import { ActionsButton } from '../show.styles'
import { IFilter, IMeta, KeyVal, ResourceScope } from '../types'
import { useList } from '../useList'
import { fetchDatabaseList } from './databases.api'
import { IDatabase } from './databases.types'
import { useDatabaseColumns } from './useDatabaseColumns'
import { useDatabaseSelectActions } from './useDatabaseSelectActions'

const DBStyledRight = styled(StyledRight)`
  gap: 20px;
`
const NoDatabases = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px;
  gap: 16px;
`

type ListType = { dbclusters: IDatabase[]; meta: IMeta }

export const DatabaseList = ({ scope }: { scope: ResourceScope }) => {
  if (scope !== 'me') {
    return (
      <NoDatabases>
        <div>Scope: "{scope}", does not have any databases.</div>
        <BackLink linkTo="/home/databases?scope=me">
          Go to the "My" scope
        </BackLink>
      </NoDatabases>
    )
  }
  const history = useHistory()
  const onRowClick = (id: string) => history.push(`/home/databases/${id}`)
  const {
    setSortBy,
    sortBy,
    setPerPageParam,
    setPageParam,
    setSearchFilter,
    filterQuery,
    perPageParam,
    query,
    selectedIndexes,
    setSelectedIndexes,
    saveColumnResizeWidth,
    colWidths,
  } = useList<ListType>({
    fetchList: fetchDatabaseList,
    resource: 'dbclusters',
    params: {
      scope: scope || undefined,
    },
  })
  const { status, data } = query

  const selectedObjects = getSelectedObjectsFromIndexes(
    selectedIndexes,
    data?.dbclusters,
  )
  const actions = useDatabaseSelectActions(selectedObjects, ['dbclusters'])

  if (status === 'error')
    return (
      <ActionsRow>
        Error! Something broke, or this resource type does not exist.
      </ActionsRow>
    )

  return (
    <>
      <div>
        <ActionsRow>
          <QuickActions>
            <ButtonSolidBlue
              data-testid="home-databases-create-link"
              as={Link}
              to={`/home/databases/create`}
            >
              <PlusIcon height={12} /> Create Database
            </ButtonSolidBlue>
          </QuickActions>
          <DBStyledRight>
            <Refresh spin={query.isFetching} onClick={() => query.refetch()}>
              <SyncIcon />
            </Refresh>
            <Dropdown
              trigger="click"
              content={<ActionsDropdownContent actions={actions} />}
            >
              {dropdownProps => (
                <ActionsButton
                  {...dropdownProps}
                  data-testid="home-databases-actions-button"
                  active={dropdownProps.isActive}
                />
              )}
            </Dropdown>
          </DBStyledRight>
        </ActionsRow>
      </div>

      <DatabaseListTable
        scope={scope}
        setFilters={setSearchFilter}
        // TODO(samuel) Typescript fix
        filters={toArrayFromObject(filterQuery as any)}
        data={data?.dbclusters}
        isLoading={status === 'loading'}
        handleRowClick={onRowClick}
        selectedRows={selectedIndexes}
        setSelectedRows={setSelectedIndexes}
        setSortBy={setSortBy}
        sortBy={sortBy}
        saveColumnResizeWidth={saveColumnResizeWidth}
        colWidths={colWidths}
      />
      <StyledPaginationSection>
        <Pagination
          page={data?.meta?.pagination?.current_page!}
          totalCount={data?.meta?.pagination?.total_count!}
          totalPages={data?.meta?.pagination?.total_pages!}
          perPage={perPageParam}
          isHidden={hidePagination(
            query.isFetched,
            data?.dbclusters?.length,
            data?.meta?.pagination?.total_pages,
          )}
          isPreviousData={data?.meta?.pagination?.prev_page! !== null}
          isNextData={data?.meta?.pagination?.next_page! !== null}
          setPage={setPageParam}
          onPerPageSelect={setPerPageParam}
        />
      </StyledPaginationSection>
      {actions['Copy to space']?.modal}
      {actions['Edit tags']?.modal}
      {actions['Edit Database Info']?.modal}
      {actions['Start']?.modal}
      {actions['Stop']?.modal}
      {actions['Terminate']?.modal}
      {actions['Attach License']?.modal}
      {actions['Detach License']?.modal}
    </>
  )
}

export const DatabaseListTable = ({
  filters,
  data,
  handleRowClick,
  isLoading,
  setFilters,
  selectedRows,
  setSelectedRows,
  setSortBy,
  sortBy,
  scope,
  saveColumnResizeWidth,
  colWidths,
}: {
  filters: IFilter[]
  data?: IDatabase[]
  handleRowClick: (fileId: string) => void
  setFilters: (val: IFilter[]) => void
  selectedRows?: Record<string, boolean>
  setSelectedRows: (ids: Record<string, boolean>) => void
  sortBy?: SortingRule<string>[]
  setSortBy: (cols: SortingRule<string>[]) => void
  isLoading: boolean
  scope: ResourceScope
  colWidths: KeyVal
  saveColumnResizeWidth: (
    columnResizing: UseResizeColumnsState<any>['columnResizing'],
  ) => void
}) => {
  const col = useDatabaseColumns({ handleRowClick, colWidths })
  const [hiddenColumns, sethiddenColumns] = useState<string[]>([])

  useEffect(() => {
    // Show or hide the Featured column based on scope
    const featuredColumnHide = scope !== 'everybody' ? 'featured' : null
    const cols = [featuredColumnHide].filter(Boolean) as string[]
    sethiddenColumns(cols)
  }, [scope])

  const columns = useMemo(() => col, [col])
  const memoData = useMemo(() => data || [], [data])

  return (
    <StyledHomeTable>
      <Table<IDatabase>
        name="apps"
        columns={columns}
        hiddenColumns={hiddenColumns}
        data={memoData}
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
        shouldResetFilters={scope as any}
        filters={filters}
        setFilters={setFilters}
        emptyComponent={<EmptyTable>You have no databases here.</EmptyTable>}
        isColsResizable
        saveColumnResizeWidth={saveColumnResizeWidth}
      />
    </StyledHomeTable>
  )
}
