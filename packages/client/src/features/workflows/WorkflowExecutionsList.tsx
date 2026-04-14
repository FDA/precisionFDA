import { useQueryClient } from '@tanstack/react-query'
import type {
  ColumnFiltersState,
  ColumnSizingState,
  ColumnSort,
  ExpandedState,
  RowSelectionState,
  VisibilityState,
} from '@tanstack/react-table'
import { useEffect, useState } from 'react'
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
import type { IFilter, IMeta } from '../home/types'
import { useFilterParams } from '../home/useFilterState'
import { useListQuery } from '../home/useListQuery'
import type { Params } from '../home/utils'
import { fetchWorkflowExecutions } from './workflows.api'

type ListType = { jobs: IExecution[]; meta: IMeta }

export const WorkflowExecutionsList = ({ spaceId, uid }: { spaceId?: string; uid: string }) => {
  const resource = 'workflow-executions'
  const locationKey = createLocationKey(resource, spaceId)
  const { pageParam, perPageParam, setPageParam, setPerPageParam } = usePaginationParams(resource)
  const { sortBy, sort, setSortBy } = useOrderByState({
    defaultOrder: { order_by: 'created_at_date_time', order_dir: 'desc' },
  })
  const { colWidths, saveColumnResizeWidth } = useColumnWidthLocalStorage(locationKey)
  const { columnVisibility, setColumnVisibility } = useHiddenColumnLocalStorage(locationKey)

  const queryCache = useQueryClient()

  const { filterQuery, setSearchFilter } = useFilterParams({
    filters: columnFilters,
  })

  const query = useListQuery<ListType>({
    fetchList: (filters: IFilter[], params: Params): Promise<ListType> =>
      fetchWorkflowExecutions(filters, { ...params, uid }),
    resource,
    pagination: { page: pageParam, perPage: perPageParam },
    sort,
    filter: filterQuery,
    params: { uid },
  })

  const setPerPage = (perPage: number): void => {
    setPerPageParam(perPage, true)
  }
  const { isLoading, data, error } = query

  const lastJsonMessage = useLastWSNotification(EXECUTION_LIST_NOTIFICATION_ACTIONS)

  useEffect(() => {
    if (lastJsonMessage == null) {
      return
    }
    queryCache.invalidateQueries({
      queryKey: [resource],
    })
  }, [lastJsonMessage])

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
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
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
  columnVisibility,
  setColumnVisibility,
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
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const columns = useExecutionColumns({ filterDataTestIdPrefix: 'workflow-executions-list' }).filter(
    (column: { id?: unknown; accessorKey?: unknown }): boolean => shouldShowExecutionColumn('workflow', column),
  )

  return (
    <StyledPageTable>
      <Table<IExecution>
        isLoading={isLoading}
        data={jobs || []}
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
        expanded={expanded}
        setExpanded={setExpanded}
        subRowKey="jobs"
      />
    </StyledPageTable>
  )
}
