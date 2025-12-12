import { useQueryClient } from '@tanstack/react-query'
import {
  ColumnDefResolved,
  ColumnFiltersState,
  ColumnSizingState,
  ColumnSort,
  RowSelectionState,
  VisibilityState,
} from '@tanstack/react-table'
import React, { useEffect, useMemo } from 'react'
import { ContentFooter } from '../../components/Page/ContentFooter'
import { Pagination, hidePagination } from '../../components/Pagination'
import Table from '../../components/Table'
import { StyledPageTable } from '../../components/Table/components/styles'
import { useColumnWidthLocalStorage } from '../../hooks/useColumnWidthLocalStorage'
import { useHiddenColumnLocalStorage } from '../../hooks/useHiddenColumnLocalStorage'
import { useOrderByState } from '../../hooks/useOrderByState'
import { usePaginationParams } from '../../hooks/usePaginationState'
import { useLastWSNotification } from '../../hooks/useLastWSNotification'
import { createLocationKey } from '../../utils'
import { toArrayFromObject } from '../../utils/object'
import { IExecution } from '../executions/executions.types'
import { useExecutionColumns } from '../executions/useExecutionColumns'
import { columnFilters } from '../home/columnFilters'
import { ResouceQueryErrorMessage } from '../home/ResouceQueryErrorMessage'
import { HomeScope, NOTIFICATION_ACTION } from '../home/types'
import { useFilterParams } from '../home/useFilterState'
import { useListQuery } from '../home/useListQuery'
import { FetchAppsExecutionsResponse, fetchAppExecutions } from './apps.api'

export const AppExecutionsList = ({ spaceId, appUid }: { spaceId?: string; appUid: string }) => {
  const resource = 'app-executions'
  const locationKey = createLocationKey(resource, spaceId)
  const { pageParam, perPageParam, setPageParam, setPerPageParam } = usePaginationParams()
  const { sort, sortBy, setSortBy } = useOrderByState({ defaultOrder: { order_by: 'created_at_date_time', order_dir: 'desc' } })
  const { colWidths, saveColumnResizeWidth } = useColumnWidthLocalStorage(locationKey)
  const { columnVisibility, setColumnVisibility } = useHiddenColumnLocalStorage(locationKey)
  const queryCache = useQueryClient()

  const { filterQuery, setSearchFilter } = useFilterParams({ filters: columnFilters })

  const query = useListQuery<FetchAppsExecutionsResponse>({
    fetchList: (filters, params) => fetchAppExecutions(filters, { ...params, appUid }),
    resource,
    scope: appUid as HomeScope,
    pagination: { page: pageParam, perPage: perPageParam },
    sort: { order_by: sort.order_by, order_dir: sort.order_dir },
    filter: filterQuery,
    params: { appUid },
  })

  const setPerPage = (perPage: number) => {
    setPerPageParam(perPage, 'pushIn')
  }

  const lastJsonMessage = useLastWSNotification([
    NOTIFICATION_ACTION.JOB_RUNNABLE,
    NOTIFICATION_ACTION.JOB_RUNNING,
    NOTIFICATION_ACTION.JOB_DONE,
    NOTIFICATION_ACTION.JOB_FAILED,
    NOTIFICATION_ACTION.JOB_OUTPUTS_SYNCED,
  ])

  useEffect(() => {
    if (lastJsonMessage == null) {
      return
    }
    queryCache.invalidateQueries({
      queryKey: [resource],
    })
  }, [lastJsonMessage])

  const { isLoading, data, error } = query

  if (error) return <ResouceQueryErrorMessage />

  return (
    <>
      <ExecutionsListTable
        jobs={data?.jobs}
        isLoading={isLoading}
        setFilters={setSearchFilter}
        filters={toArrayFromObject(filterQuery)}
        setSortBy={setSortBy}
        sortBy={sortBy}
        setColumnSizing={saveColumnResizeWidth}
        columnSizing={colWidths}
        setColumnVisibility={setColumnVisibility}
        columnVisibility={columnVisibility}
      />
      <ContentFooter>
        <Pagination
          page={data?.meta?.pagination?.current_page}
          totalCount={data?.meta?.pagination?.total_count}
          totalPages={data?.meta?.pagination?.total_pages}
          perPage={perPageParam}
          isHidden={hidePagination(query.isFetched, data?.jobs?.length, data?.meta?.pagination?.total_pages)}
          setPage={p => setPageParam(p, 'replaceIn')}
          onPerPageSelect={setPerPage}
        />
      </ContentFooter>
    </>
  )
}

export const ExecutionsListTable = ({
  jobs,
  isLoading,
  sortBy,
  setSortBy,
  filters,
  setFilters,
  selectedRows,
  setSelectedRows,
  columnSizing,
  setColumnSizing,
  setColumnVisibility,
  columnVisibility,
}: {
  jobs?: IExecution[]
  isLoading: boolean
  sortBy: ColumnSort[]
  setSortBy: (cols: ColumnSort[]) => void
  filters: ColumnFiltersState
  setFilters: (val: ColumnFiltersState) => void
  selectedRows?: RowSelectionState
  setSelectedRows?: (ids: RowSelectionState) => void
  columnSizing: ColumnSizingState
  setColumnSizing: (columnResizing: ColumnSizingState) => void
  setColumnVisibility: (cols: VisibilityState) => void
  columnVisibility: VisibilityState
}) => {
  function filterColsByScope(c: ColumnDefResolved<IExecution>): boolean {
    // Check if any of the conditions is true, then hide the column
    return !(c.accessorKey === 'featured' || c.accessorKey === 'app_title' || c.accessorKey === 'location' || c.id === 'select')
  }
  // @ts-expect-error: type is broken from react-table library
  const col = useExecutionColumns({}).filter(filterColsByScope)

  const data = useMemo(() => jobs || [], [jobs])

  return (
    <StyledPageTable>
      <Table<IExecution>
        isLoading={isLoading}
        data={data || []}
        columns={col}
        columnSizing={columnSizing}
        setColumnSizing={setColumnSizing}
        rowSelection={selectedRows ?? {}}
        setSelectedRows={setSelectedRows}
        setColumnFilters={setFilters}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        columnSortBy={sortBy}
        setColumnSortBy={setSortBy}
        columnFilters={filters}
      />
    </StyledPageTable>
  )
}
