import { useQueryClient } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import useWebSocket from 'react-use-websocket'
import {
  ColumnDefResolved,
  ColumnFiltersState,
  ColumnSizingState,
  ColumnSort,
  ExpandedState,
  RowSelectionState,
  VisibilityState,
} from '@tanstack/react-table'
import { ContentFooter } from '../../components/Page/ContentFooter'
import { Pagination, hidePagination } from '../../components/Pagination'
import Table from '../../components/Table'
import { useColumnWidthLocalStorage } from '../../hooks/useColumnWidthLocalStorage'
import { useOrderByState } from '../../hooks/useOrderByState'
import { usePaginationParams } from '../../hooks/usePaginationState'
import { DEFAULT_RECONNECT_ATTEMPTS, DEFAULT_RECONNECT_INTERVAL, SHOULD_RECONNECT, getNodeWsUrl } from '../../utils/config'
import { toArrayFromObject } from '../../utils/object'
import { IExecution } from '../executions/executions.types'
import { createLocationKey } from '../../utils'
import { useExecutionColumns } from '../executions/useExecutionColumns'
import { columnFilters } from '../home/columnFilters'
import { IMeta, NOTIFICATION_ACTION, Notification, WEBSOCKET_MESSAGE_TYPE, WebSocketMessage } from '../home/types'
import { useFilterParams } from '../home/useFilterState'
import { useListQuery } from '../home/useListQuery'
import { fetchWorkflowExecutions } from './workflows.api'
import { ResouceQueryErrorMessage } from '../home/ResouceQueryErrorMessage'
import { useHiddenColumnLocalStorage } from '../../hooks/useHiddenColumnLocalStorage'
import { StyledPageTable } from '../../components/Table/components/styles'
import { useAuthUser } from '../auth/useAuthUser'
import { useLastWSNotification } from '../../hooks/useToastWSHandler'

type ListType = { jobs: IExecution[]; meta: IMeta }

export const WorkflowExecutionsList = ({ spaceId, uid }: { spaceId?: string; uid: string }) => {
  const resource = 'workflow-executions'
  const locationKey = createLocationKey(resource, spaceId)
  const { pageParam, perPageParam, setPageParam, setPerPageParam } = usePaginationParams()
  const { sortBy, sort, setSortBy } = useOrderByState({ defaultOrder: { order_by: 'created_at_date_time', order_dir: 'DESC' } })
  const { colWidths, saveColumnResizeWidth } = useColumnWidthLocalStorage(locationKey)
  const { columnVisibility, setColumnVisibility } = useHiddenColumnLocalStorage(locationKey)
  const user = useAuthUser()

  const queryCache = useQueryClient()

  const { filterQuery, setSearchFilter } = useFilterParams({
    filters: columnFilters,
  })

  const query = useListQuery<ListType>({
    fetchList: (filters, params) => fetchWorkflowExecutions(filters, { ...params, uid }),
    resource,
    scope: uid,
    pagination: { page: pageParam, perPage: perPageParam },
    order: { order_by: sort?.order_by, order_dir: sort?.order_dir },
    filter: filterQuery,
    params: { uid },
  })

  const setPerPage = (perPage: number) => {
    setPerPageParam(perPage, 'pushIn')
  }
  const { isLoading, data, error } = query

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
  function filterColsByScope(c: ColumnDefResolved<IExecution>): boolean {
    // Check if any of the conditions is true, then hide the column
    return !(
      c.accessorKey === 'workflow' ||
      c.accessorKey === 'featured' ||
      c.accessorKey === 'location' ||
      c.accessorKey === 'tags' ||
      c.id === 'select'
    )
  }
  // @ts-expect-error: type is broken from react-table library
  const col = useExecutionColumns({ filterDataTestIdPrefix: 'workflow-executions-list' }).filter(filterColsByScope)

  return (
    <StyledPageTable>
      <Table<IExecution>
        isLoading={isLoading}
        data={jobs || []}
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
        expanded={expanded}
        setExpanded={setExpanded}
        subRowKey="jobs"
      />
    </StyledPageTable>
  )
}
