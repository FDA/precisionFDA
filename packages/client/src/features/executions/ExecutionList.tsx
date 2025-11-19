import { useQueryClient } from '@tanstack/react-query'
import {
  ColumnDefResolved,
  ColumnFiltersState,
  ColumnSizingState,
  ColumnSort,
  ExpandedState,
  RowSelectionState,
  VisibilityState,
} from '@tanstack/react-table'
import React, { useEffect, useMemo, useState } from 'react'
import useWebSocket from 'react-use-websocket'
import { ActionsMenu } from '../../components/Menu'
import { ContentFooter } from '../../components/Page/ContentFooter'
import { Pagination } from '../../components/Pagination'
import Table from '../../components/Table'
import { StyledPageTable } from '../../components/Table/components/styles'
import { HoverDNAnexusLogo } from '../../components/icons/DNAnexusLogo'
import { ErrorBoundary } from '../../utils/ErrorBoundry'
import { DEFAULT_RECONNECT_ATTEMPTS, DEFAULT_RECONNECT_INTERVAL, SHOULD_RECONNECT, getNodeWsUrl } from '../../utils/config'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '../../utils/object'
import { useAuthUser } from '../auth/useAuthUser'
import { ActionsMenuContent } from '../home/ActionMenuContent'
import { ActionModalsRenderer } from '../home/ActionModalsRenderer'
import { ResouceQueryErrorMessage } from '../home/ResouceQueryErrorMessage'
import { ActionsRow } from '../home/home.styles'
import { ActionsButton, ResourceHeader } from '../home/show.styles'
import { HomeScope, IMeta, NOTIFICATION_ACTION, Notification, WEBSOCKET_MESSAGE_TYPE, WebSocketMessage } from '../home/types'
import { useList } from '../home/useList'
import { usePropertiesQuery } from '../home/usePropertiesQuery'
import { fetchExecutions } from './executions.api'
import { IExecution } from './executions.types'
import { useExecutionColumns } from './useExecutionColumns'
import { useExecutionSelectActions } from './useExecutionSelectActions'
import { useLastWSNotification } from '../../hooks/useToastWSHandler'

type ListType = { jobs: IExecution[]; meta: IMeta }

export const ExecutionList = ({ homeScope, spaceId }: { homeScope?: HomeScope; spaceId?: string }) => {
  const user = useAuthUser()
  const isAdmin = user?.isAdmin

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
      queryKey: ['jobs'],
    })
  }, [lastJsonMessage])

  const selectedFileObjects = getSelectedObjectsFromIndexes(selectedIndexes, data?.jobs)
  const { actions, modals } = useExecutionSelectActions({ homeScope, selectedItems: selectedFileObjects, resourceKeys: ['jobs'] })

  if (error) return <ResouceQueryErrorMessage />

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
          setPage={p => setPageParam(p, 'replaceIn')}
          onPerPageSelect={p => setPerPageParam(p, 'replaceIn')}
        />
        <HoverDNAnexusLogo opacity height={14} />
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
  function filterColsByScope(c: ColumnDefResolved<IExecution>): boolean {
    // Check if any of the conditions is true, then hide the column
    return !(
      // If the homeScope is 'me', hide 'added_by' regardless of other conditions.
      (
        (homeScope === 'me' && c.accessorKey === 'added_by') ||
        // Hide 'location' for all homeScopes except 'spaces'.
        (homeScope !== 'spaces' && c.accessorKey === 'location') ||
        // Hide 'featured' for all homeScopes except 'everybody'.
        (homeScope !== 'everybody' && c.accessorKey === 'featured') ||
        c.accessorKey === 'created_at_date_time' ||
        c.accessorKey === 'workflow_title'
      )
    )
  }

  // @ts-expect-error: type is broken from react-table library
  const col = useExecutionColumns({ isAdmin, properties }).filter(filterColsByScope)

  const data = useMemo(() => jobs || [], [jobs, selectedRows])

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
        expanded={expanded}
        setExpanded={setExpanded}
        subRowKey="jobs"
        emptyText="You don't have any app executions yet."
      />
    </StyledPageTable>
  )
}
