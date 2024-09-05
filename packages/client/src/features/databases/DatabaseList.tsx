import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SortingRule, UseResizeColumnsState } from 'react-table'
import styled from 'styled-components'
import Dropdown from '../../components/Dropdown'
import { ContentFooter } from '../../components/Page/ContentFooter'
import { BackLink } from '../../components/Page/PageBackLink'
import { Refresh } from '../../components/Page/styles'
import { Pagination } from '../../components/Pagination'
import Table from '../../components/Table/Table'
import { EmptyTable } from '../../components/Table/styles'
import { HoverDNAnexusLogo } from '../../components/icons/DNAnexusLogo'
import { PlusIcon } from '../../components/icons/PlusIcon'
import { SyncIcon } from '../../components/icons/SyncIcon'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '../../utils/object'
import { ActionsDropdownContent } from '../home/ActionDropdownContent'
import {
  ActionsRow,
  QuickActions,
  StyledHomeTable, StyledRight,
} from '../home/home.styles'
import { ActionsButton, ResourceHeader } from '../home/show.styles'
import { IFilter, IMeta, KeyVal, HomeScope } from '../home/types'
import { useList } from '../home/useList'
import { usePropertiesQuery } from '../home/usePropertiesQuery'
import { fetchDatabaseList } from './databases.api'
import { IDatabase } from './databases.types'
import { useDatabaseColumns } from './useDatabaseColumns'
import { useDatabaseSelectActions } from './useDatabaseSelectActions'
import { Button } from '../../components/Button'

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

export const DatabaseList = ({ homeScope }: { homeScope?: HomeScope }) => {
  if (homeScope !== 'me') {
    return (
      <NoDatabases>
        <div>Scope: "{homeScope}", does not have any databases.</div>
        <BackLink linkTo="/home/databases?scope=me">
          Go to the "My" scope
        </BackLink>
      </NoDatabases>
    )
  }
  const navigate = useNavigate()
  const onRowClick = (id: string) => navigate(`/home/databases/${id}`)
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
    hiddenColumns,
    saveHiddenColumns,
  } = useList<ListType>({
    fetchList: fetchDatabaseList,
    resource: 'dbclusters',
    params: {
      scope: homeScope || undefined,
    },
  })
  const { isLoading, data, error } = query
  const { data: propertiesData } = usePropertiesQuery('dbCluster', homeScope)

  const selectedObjects = getSelectedObjectsFromIndexes(
    selectedIndexes,
    data?.dbclusters,
  )
  const actions = useDatabaseSelectActions(selectedObjects, ['dbclusters'])

  if (error)
    return (
      <ActionsRow>
        Error! Something broke, or this resource type does not exist.
      </ActionsRow>
    )

  return (
    <>
      <ResourceHeader>
        <ActionsRow>
          <QuickActions>
            <Button
              data-variant='primary'
              data-testid="home-databases-create-link"
              as={Link}
              to="/home/databases/create"
            >
              <PlusIcon height={12} /> Create Database
            </Button>
          </QuickActions>
          <DBStyledRight>
            <Refresh $spin={query.isFetching} onClick={() => query.refetch()}>
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
      </ResourceHeader>

      <DatabaseListTable
        homeScope={homeScope}
        setFilters={setSearchFilter}
        // TODO(samuel) Typescript fix
        filters={toArrayFromObject(filterQuery as any)}
        data={data?.dbclusters}
        properties={propertiesData?.keys}
        isLoading={isLoading}
        handleRowClick={onRowClick}
        selectedRows={selectedIndexes}
        setSelectedRows={setSelectedIndexes}
        setSortBy={setSortBy}
        sortBy={sortBy}
        saveColumnResizeWidth={saveColumnResizeWidth}
        colWidths={colWidths}
        hiddenColumns={hiddenColumns}
        saveHiddenColumns={saveHiddenColumns}
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

      {actions['Copy to space']?.modal}
      {actions['Edit tags']?.modal}
      {actions['Edit properties']?.modal}
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
  properties,
  handleRowClick,
  isLoading,
  setFilters,
  selectedRows,
  setSelectedRows,
  setSortBy,
  sortBy,
  homeScope,
  saveColumnResizeWidth,
  colWidths,
  hiddenColumns,
  saveHiddenColumns,
}: {
  filters: IFilter[]
  data?: IDatabase[]
  properties?: string[]
  handleRowClick: (fileId: string) => void
  setFilters: (val: IFilter[]) => void
  selectedRows?: Record<string, boolean>
  setSelectedRows: (ids: Record<string, boolean>) => void
  sortBy?: SortingRule<string>[]
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
  const col = useDatabaseColumns({ handleRowClick, colWidths, properties })

  const columns = useMemo(() => col, [col, properties])
  const memoData = useMemo(() => data || [], [data])

  return (
    <StyledHomeTable>
      <Table<IDatabase>
        name="apps"
        columns={columns}
        enableColumnSelect
        hiddenColumns={hiddenColumns}
        saveHiddenColumns={saveHiddenColumns}
        data={memoData}
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
        emptyComponent={<EmptyTable>You have no databases here.</EmptyTable>}
        isColsResizable
        saveColumnResizeWidth={saveColumnResizeWidth}
      />
    </StyledHomeTable>
  )
}
