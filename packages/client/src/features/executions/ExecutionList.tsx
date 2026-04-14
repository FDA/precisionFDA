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
import { ActionsMenu } from '@/components/Menu'
import { ContentFooter } from '@/components/Page/ContentFooter'
import { Pagination } from '@/components/Pagination'
import { StyledPageTable } from '@/components/Table/components/styles'
import { useLastWSNotification } from '@/hooks/useLastWSNotification'
import { ErrorBoundary } from '@/utils/ErrorBoundry'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '@/utils/object'
import Table from '../../components/Table'
import { ActionsMenuContent } from '../home/ActionMenuContent'
import { ActionModalsRenderer } from '../home/ActionModalsRenderer'
import { ActionsRow } from '../home/home.styles'
import { ResourceQueryErrorMessage } from '../home/ResourceQueryErrorMessage'
import { ResourceHeader } from '../home/show.styles'
import type { HomeScope, IMeta } from '../home/types'
import { useList } from '../home/useList'
import { usePropertiesQuery } from '../home/usePropertiesQuery'
import { shouldShowExecutionColumn } from './executionColumnVisibility'
import { EXECUTION_LIST_NOTIFICATION_ACTIONS, EXECUTION_LIST_QUERY_KEY } from './executionList.constants'
import { fetchExecutions } from './executions.api'
import type { IExecution } from './executions.types'
import { useExecutionColumns } from './useExecutionColumns'
import { useExecutionSelectActions } from './useExecutionSelectActions'

type ListType = { jobs: IExecution[]; meta: IMeta }

export const ExecutionList = ({
  homeScope,
  spaceId,
  isAdmin,
}: {
  homeScope?: HomeScope
  spaceId?: string | number
  isAdmin?: boolean
}) => {
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
    setColumnVisibility,
    columnVisibility,
  } = useList<ListType>({
    fetchList: fetchExecutions,
    resource: 'jobs',
    params: {
      spaceId: spaceId || undefined,
      scope: homeScope || undefined,
    },
  })
  const queryCache = useQueryClient()
  const { isLoading, data, error } = query
  const { data: propertiesData } = usePropertiesQuery('job', homeScope, spaceId)

  const lastJsonMessage = useLastWSNotification(EXECUTION_LIST_NOTIFICATION_ACTIONS)

  useEffect(() => {
    if (lastJsonMessage == null) {
      return
    }
    queryCache.invalidateQueries({
      queryKey: EXECUTION_LIST_QUERY_KEY,
    })
  }, [lastJsonMessage])

  const selectedExecutionObjects = getSelectedObjectsFromIndexes(selectedIndexes, data?.jobs)
  const { actions, modals } = useExecutionSelectActions({
    homeScope,
    selectedItems: selectedExecutionObjects,
    resourceKeys: ['jobs'],
  })

  if (error) return <ResourceQueryErrorMessage />

  return (
    <ErrorBoundary>
      <ResourceHeader>
        <ActionsRow>
          <div />
          <ActionsMenu data-testid="home-executions-actions-button">
            <ActionsMenuContent actions={actions} />
          </ActionsMenu>
        </ActionsRow>
      </ResourceHeader>

      <ExecutionsListTable
        isAdmin={isAdmin}
        homeScope={homeScope}
        setFilters={setSearchFilter}
        filters={toArrayFromObject(filterQuery)}
        jobs={data?.jobs}
        properties={propertiesData?.keys}
        isLoading={isLoading}
        selectedRows={selectedIndexes}
        setSelectedRows={setSelectedIndexes}
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
          isHidden={false}
          setPage={(p: number) => setPageParam(p, true)}
          onPerPageSelect={(p: number) => setPerPageParam(p, true)}
        />
      </ContentFooter>

      <ActionModalsRenderer modals={modals} />
    </ErrorBoundary>
  )
}

export const ExecutionsListTable = ({
  isAdmin,
  filters,
  jobs,
  properties,
  isLoading,
  setFilters,
  selectedRows,
  setSelectedRows,
  setSortBy,
  sortBy,
  homeScope,
  setColumnSizing,
  columnSizing,
  columnVisibility,
  setColumnVisibility,
}: {
  isAdmin?: boolean
  jobs?: IExecution[]
  properties?: string[]
  isLoading: boolean
  homeScope?: HomeScope
  sortBy: ColumnSort[]
  setSortBy: (cols: ColumnSort[]) => void
  filters: ColumnFiltersState
  setFilters: (val: ColumnFiltersState) => void
  selectedRows?: RowSelectionState
  setSelectedRows: (ids: RowSelectionState) => void
  columnSizing: ColumnSizingState
  setColumnSizing: (columnResizing: ColumnSizingState) => void
  setColumnVisibility: (cols: VisibilityState) => void
  columnVisibility: VisibilityState
}) => {
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const columns = useExecutionColumns({ isAdmin, properties }).filter(
    (column: { id?: unknown; accessorKey?: unknown }) => shouldShowExecutionColumn('home', column, homeScope),
  )

  return (
    <StyledPageTable>
      <Table<IExecution>
        isLoading={isLoading}
        data={jobs ?? []}
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
        emptyText="You don't have any app executions yet."
      />
    </StyledPageTable>
  )
}
