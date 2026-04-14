import { useQueryClient } from '@tanstack/react-query'
import type {
  ColumnFiltersState,
  ColumnSizingState,
  ColumnSort,
  RowSelectionState,
  VisibilityState,
} from '@tanstack/react-table'
import { useEffect, useMemo } from 'react'
import { ContentFooter } from '@/components/Page/ContentFooter'
import { hidePagination, Pagination } from '@/components/Pagination'
import { StyledPageTable } from '@/components/Table/components/styles'
import { useColumnWidthLocalStorage } from '@/hooks/useColumnWidthLocalStorage'
import { useHiddenColumnLocalStorage } from '@/hooks/useHiddenColumnLocalStorage'
import { useLastWSNotification } from '@/hooks/useLastWSNotification'
import { useOrderByState } from '@/hooks/useOrderByState'
import { usePaginationParams } from '@/hooks/usePaginationState'
import { createLocationKey } from '@/utils'
import { toArrayFromObject } from '@/utils/object'
import Table from '../../components/Table'
import { shouldShowExecutionColumn } from '../executions/executionColumnVisibility'
import { EXECUTION_LIST_NOTIFICATION_ACTIONS } from '../executions/executionList.constants'
import type { IExecution } from '../executions/executions.types'
import { useExecutionColumns } from '../executions/useExecutionColumns'
import { columnFilters } from '../home/columnFilters'
import { ResourceQueryErrorMessage } from '../home/ResourceQueryErrorMessage'
import type { IFilter } from '../home/types'
import { useFilterParams } from '../home/useFilterState'
import { useListQuery } from '../home/useListQuery'
import type { Params } from '../home/utils'
import { type FetchAppsExecutionsResponse, fetchAppExecutions } from './apps.api'

export const AppExecutionsList = ({ spaceId, appUid }: { spaceId?: string; appUid: string }) => {
  const resource = 'app-executions'
  const locationKey = createLocationKey(resource, spaceId)
  const { pageParam, perPageParam, setPageParam, setPerPageParam } = usePaginationParams(resource)
  const { sort, sortBy, setSortBy } = useOrderByState({
    defaultOrder: { order_by: 'created_at_date_time', order_dir: 'desc' },
  })
  const { colWidths, saveColumnResizeWidth } = useColumnWidthLocalStorage(locationKey)
  const { columnVisibility, setColumnVisibility } = useHiddenColumnLocalStorage(locationKey)
  const queryCache = useQueryClient()

  const { filterQuery, setSearchFilter } = useFilterParams({ filters: columnFilters })

  const query = useListQuery<FetchAppsExecutionsResponse>({
    fetchList: (filters: IFilter[], params: Params): Promise<FetchAppsExecutionsResponse> =>
      fetchAppExecutions(filters, { ...params, appUid }),
    resource,
    pagination: { page: pageParam, perPage: perPageParam },
    sort: { order_by: sort.order_by, order_dir: sort.order_dir },
    filter: filterQuery,
    params: { appUid },
  })

  const setPerPage = (perPage: number): void => {
    setPerPageParam(perPage, true)
  }

  const lastJsonMessage = useLastWSNotification(EXECUTION_LIST_NOTIFICATION_ACTIONS)

  useEffect(() => {
    if (lastJsonMessage == null) {
      return
    }
    queryCache.invalidateQueries({
      queryKey: [resource],
    })
  }, [lastJsonMessage])

  const { isLoading, data, error } = query

  if (error) return <ResourceQueryErrorMessage />

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
          setPage={(p: number): void => setPageParam(p, true)}
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
  const columns = useExecutionColumns({}).filter((column: { id?: unknown; accessorKey?: unknown }): boolean =>
    shouldShowExecutionColumn('app', column),
  )

  const data = useMemo(() => jobs || [], [jobs])

  return (
    <StyledPageTable>
      <Table<IExecution>
        isLoading={isLoading}
        data={data || []}
        columns={columns}
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
