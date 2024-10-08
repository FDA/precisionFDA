import React, { useMemo, useState } from 'react'
import { SortingRule, UseResizeColumnsState } from 'react-table'
import styled from 'styled-components'
import { hidePagination, Pagination } from '../../../components/Pagination'
import { EmptyTable } from '../../../components/Table/styles'
import Table from '../../../components/Table/Table'
import { ErrorBoundary } from '../../../utils/ErrorBoundry'
import { columnFilters } from '../columnFilters'
import { IExecution } from '../executions/executions.types'
import { getStateBgColorFromState } from '../executions/executions.util'
import { useExecutionColumns } from '../executions/useExecutionColumns'
import {
  StyledHomeTable,
} from '../home.styles'
import { IFilter, IMeta, KeyVal } from '../types'
import { useColumnWidthLocalStorage } from '../../../hooks/useColumnWidthLocalStorage'
import { useFilterParams } from '../useFilterState'
import { useListQuery } from '../useListQuery'
import { useOrderByState } from '../../../hooks/useOrderByState'
import { fetchAppExecutions } from './apps.api'
import { usePaginationParams } from '../../../hooks/usePaginationState'
import { toArrayFromObject } from '../../../utils/object'

const ExecutionsPagination = styled.div`
  padding-left: 12px;
  padding-top: 32px;
  padding-bottom: 16px;
`

type ListType = { jobs: IExecution[]; meta: IMeta }

export const AppExecutionsList = ({ appUid }: { appUid: string }) => {
  const resource = 'app-executions'
  const { pageParam, perPageParam, setPageParam, setPerPageParam } = usePaginationParams()
  const { sort, sortBy, setSortBy } = useOrderByState({ defaultOrder: { order_by: 'created_at_date_time', order_dir: 'DESC' }})
  const { colWidths, saveColumnResizeWidth } = useColumnWidthLocalStorage(resource)

  // useEffect(() => {
  //   setSortByParam({orderBy: 'created_at_date_time', order: 'desc'})
  // }, [])

  const { filterQuery, setSearchFilter } = useFilterParams({ filters: columnFilters })

  const query = useListQuery<ListType>({
    fetchList: fetchAppExecutions,
    resource,
    scope: appUid as any,
    pagination: { page: pageParam, perPage: perPageParam },
    order: { order_by: sort.order_by, order_dir: sort.order_dir },
    filter: filterQuery,
    params: { appUid },
  })

  const setPerPage = (perPage: number) => {
    setPerPageParam(perPage, 'pushIn')
  }
  const { status, data, error } = query

  if (status === 'error') return <div>Error! {JSON.stringify(error)}</div>

  return (
    <ErrorBoundary>
      <ExecutionsListTable
        setFilters={setSearchFilter}
        // TODO(samuel) fix possibly undefined values from querystring
        filters={toArrayFromObject(filterQuery as any)}
        jobs={data?.jobs}
        isLoading={status === 'loading'}
        setSortBy={setSortBy}
        sortBy={sortBy}
        saveColumnResizeWidth={saveColumnResizeWidth}
        colWidths={colWidths}
      />
      <ExecutionsPagination>
        <Pagination
          page={data?.meta?.pagination?.current_page}
          totalCount={data?.meta?.pagination?.total_count}
          totalPages={data?.meta?.pagination?.total_pages}
          perPage={perPageParam}
          isHidden={hidePagination(query.isFetched, data?.jobs?.length, data?.meta?.pagination?.total_pages)}
          isPreviousData={data?.meta?.pagination?.prev_page !== null}
          isNextData={data?.meta?.pagination?.next_page !== null}
          setPage={setPageParam}
          onPerPageSelect={setPerPage}
        />
      </ExecutionsPagination>
    </ErrorBoundary>
  )
}


export const ExecutionsListTable = ({
  filters,
  jobs,
  isLoading,
  setFilters,
  setSortBy,
  sortBy,
  saveColumnResizeWidth,
  colWidths,
}: {
  filters: IFilter[]
  jobs?: IExecution[]
  setFilters: (val: IFilter[]) => void
  sortBy?: SortingRule<string>[]
  setSortBy: (cols: SortingRule<string>[]) => void
  isLoading: boolean
  colWidths: KeyVal
  saveColumnResizeWidth: (
    columnResizing: UseResizeColumnsState<any>['columnResizing']
  ) => void
}) => {
  const col = useExecutionColumns({ colWidths })
  const [hiddenColumns, sethiddenColumns] = useState<string[]>(['featured', 'app_title', 'location'])

  const columns = useMemo(() => col, [col])

  const data = useMemo(() => jobs || [], [jobs])

  return (
    <StyledHomeTable>
      <Table<IExecution>
        name="jobs"
        columns={columns}
        hiddenColumns={hiddenColumns}
        data={data}
        loading={isLoading}
        loadingComponent={<div>Loading...</div>}
        sortByPreference={sortBy}
        setSortByPreference={setSortBy}
        manualFilters
        filters={filters}
        setFilters={setFilters}
        emptyComponent={<EmptyTable>You have no executions here.</EmptyTable>}
        isColsResizable
        isSortable
        isFilterable
        saveColumnResizeWidth={saveColumnResizeWidth}
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
      />
    </StyledHomeTable>
  )
}
