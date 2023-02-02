import React, { useEffect, useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { SortingRule, UseResizeColumnsState } from 'react-table'
import Dropdown from '../../../components/Dropdown'
import { hidePagination, Pagination } from '../../../components/Pagination'
import { EmptyTable } from '../../../components/Table/styles'
import Table from '../../../components/Table/Table'
import { colors } from '../../../styles/theme'
import { ErrorBoundary } from '../../../utils/ErrorBoundry'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '../../../utils/object'
import { useAuthUser } from '../../auth/useAuthUser'
import { ActionsDropdownContent } from '../ActionDropdownContent'
import {
  ActionsRow, StyledHomeTable, StyledPaginationSection,
} from '../home.styles'
import { ActionsButton } from '../show.styles'
import { IFilter, IMeta, KeyVal, ResourceScope } from '../types'
import { useList } from '../useList'
import { fetchExecutions } from './executions.api'
import { IExecution } from './executions.types'
import { getStateBgColorFromState } from './executions.util'
import { getSubComponentValue } from './getSubComponentValue'
import { useExecutionColumns } from './useExecutionColumns'
import { useExecutionActions } from './useExecutionSelectActions'

type ListType = { jobs: IExecution[]; meta: IMeta }

export const ExecutionList = ({ scope, spaceId }: { scope?: ResourceScope, spaceId?: string }) => {
  const history = useHistory()
  const user = useAuthUser()
  const isAdmin = user?.isAdmin

  const onRowClick = (uid: string) => history.push(`/home/executions/${uid}`)
  const {
    setPerPageParam,
    setPageParam,
    setSearchFilter,
    filterQuery,
    perPageParam,
    setSortBy,
    sortBy,
    query,
    selectedIndexes,
    setSelectedIndexes,
    saveColumnResizeWidth,
    colWidths,
  } = useList<ListType>({
    fetchList: fetchExecutions,
    resource: 'jobs',
    params: {
      spaceId: spaceId || undefined,
      scope: scope || undefined,
    },
  })
  const { status, data, error } = query

  const selectedFileObjects = getSelectedObjectsFromIndexes(
    selectedIndexes,
    data?.jobs,
  )
  const actions = useExecutionActions({ scope, selectedItems: selectedFileObjects, resourceKeys: ['jobs']})

  if (status === 'error') return <div>Error! {JSON.stringify(error)}</div>

  return (
    <ErrorBoundary>
      <div>
        <ActionsRow>
          <div />
          <Dropdown
            trigger="click"
            content={
              <ActionsDropdownContent
                actions={actions}
                message={
                  scope === 'spaces' &&
                  'To perform other actions on this file, access it from the Space'
                }
              />
            }
          >
            {dropdownProps => (
              <ActionsButton
                {...dropdownProps}
                data-testid="home-executions-actions-button"
                active={dropdownProps.isActive}
              />
            )}
          </Dropdown>
        </ActionsRow>
      </div>

      <ExecutionsListTable
        isAdmin={isAdmin}
        scope={scope}
        setFilters={setSearchFilter}
        // TODO(samuel) Typescript fix
        filters={toArrayFromObject(filterQuery as any)}
        jobs={data?.jobs}
        isLoading={status === 'loading'}
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
          isHidden={hidePagination(query.isFetched, data?.jobs?.length, data?.meta?.pagination?.total_pages)}
          isPreviousData={data?.meta?.pagination?.prev_page! !== null}
          isNextData={data?.meta?.pagination?.next_page! !== null}
          setPage={setPageParam}
          onPerPageSelect={setPerPageParam}
        />
      </StyledPaginationSection>
      {actions['Copy to space']?.modal}
      {actions['Edit tags']?.modal}
      {actions['Attach to...']?.modal}
      {actions['Terminate']?.modal}
    </ErrorBoundary>
  )
}



export const ExecutionsListTable = ({
  isAdmin,
  filters,
  jobs,
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
  isAdmin?: boolean
  filters: IFilter[]
  jobs?: IExecution[]
  setFilters: (val: IFilter[]) => void
  selectedRows?: Record<string, boolean>
  setSelectedRows: (ids: Record<string, boolean>) => void
  sortBy?: SortingRule<string>[]
  setSortBy: (cols: SortingRule<string>[]) => void
  isLoading: boolean
  scope?: ResourceScope
  colWidths: KeyVal
  saveColumnResizeWidth: (
    columnResizing: UseResizeColumnsState<any>['columnResizing']
  ) => void
}) => {
  const col = useExecutionColumns({ colWidths, isAdmin })
  const [hiddenColumns, sethiddenColumns] = useState<string[]>([])

  useEffect(() => {
    // Show or hide the Featured column based on scope
    const featuredColumnHide = scope !== 'everybody' ? 'featured' : null
    const locationColumnHide = scope !== 'spaces' ? 'location' : null
    const launchedByColumnHide = scope === 'me' ? 'launched_by' : null
    const cols = ['workflow', 'created_at_date_time', featuredColumnHide, locationColumnHide, launchedByColumnHide].filter(Boolean) as string[]
    sethiddenColumns(cols)
  }, [scope])

  const columns = useMemo(() => col, [col])

  const data = useMemo(() => jobs || [], [jobs])

  return (
    <StyledHomeTable>
      <Table<IExecution>
        name="jobs"
        columns={columns}
        hiddenColumns={hiddenColumns}
        data={data}
        isSelectable
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
        emptyComponent={<EmptyTable>You have no executions here.</EmptyTable>}
        isColsResizable
        isSortable
        isFilterable
        saveColumnResizeWidth={saveColumnResizeWidth}
        isExpandable
        cellProps={cell => 
          cell.column.id === 'state'
            ? {
                style: {
                  backgroundColor: cell.row.original.jobs
                    ? getStateBgColorFromState(
                        cell.row.original.jobs[
                          cell.row.original.jobs.length - 1
                        ].state,
                      )
                    : getStateBgColorFromState(cell.row.original.state),
                  boxShadow: 'none',
                },
              }
            : {}
        }
        rowProps={row => ({
          className: 'hideExpand',
        })}
        updateRowState={row => ({
          ...row,
          hideExpand: !row.original.jobs,
        })}
        subcomponent={row => (
            <>
              {row.original.jobs &&
                row.original.jobs.map((job, index) => (
                    <div
                      className="tr sub"
                      {...row.getRowProps()}
                      key={`${row.getRowProps().key}-sub-${index}`}
                      style={{
                        ...row.getRowProps().style,
                        backgroundColor: colors.backgroundLightGray,
                      }}
                    >
                      {row.cells.map(cell => getSubComponentValue(job, cell))}
                    </div>
                  ))}
            </>
          )}
      />
    </StyledHomeTable>
  )
}
