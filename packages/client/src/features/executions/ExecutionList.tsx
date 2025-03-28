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
import Dropdown from '../../components/Dropdown'
import { ContentFooter } from '../../components/Page/ContentFooter'
import { Pagination } from '../../components/Pagination'
import Table from '../../components/Table'
import { HoverDNAnexusLogo } from '../../components/icons/DNAnexusLogo'
import { ErrorBoundary } from '../../utils/ErrorBoundry'
import { DEFAULT_RECONNECT_ATTEMPTS, DEFAULT_RECONNECT_INTERVAL, SHOULD_RECONNECT, getNodeWsUrl } from '../../utils/config'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '../../utils/object'
import { useAuthUser } from '../auth/useAuthUser'
import { ActionsDropdownContent } from '../home/ActionDropdownContent'
import { ActionsRow } from '../home/home.styles'
import { ActionsButton, ResourceHeader } from '../home/show.styles'
import { HomeScope, IMeta, NOTIFICATION_ACTION, Notification, WEBSOCKET_MESSAGE_TYPE, WebSocketMessage } from '../home/types'
import { useList } from '../home/useList'
import { usePropertiesQuery } from '../home/usePropertiesQuery'
import { fetchExecutions } from './executions.api'
import { IExecution } from './executions.types'
import { useExecutionColumns } from './useExecutionColumns'
import { useExecutionActions } from './useExecutionSelectActions'
import { StyledPageTable } from '../../components/Table/components/styles'

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

  const { lastJsonMessage } = useWebSocket<WebSocketMessage>(getNodeWsUrl(), {
    share: true,
    reconnectInterval: DEFAULT_RECONNECT_INTERVAL,
    reconnectAttempts: DEFAULT_RECONNECT_ATTEMPTS,
    shouldReconnect: () => SHOULD_RECONNECT,
    filter: message => {
      try {
        const messageData = JSON.parse(message.data)
        const notification = messageData.data as Notification
        return (
          messageData.type === WEBSOCKET_MESSAGE_TYPE.NOTIFICATION &&
          [
            NOTIFICATION_ACTION.JOB_RUNNABLE,
            NOTIFICATION_ACTION.JOB_RUNNING,
            NOTIFICATION_ACTION.JOB_DONE,
            NOTIFICATION_ACTION.JOB_FAILED,
            NOTIFICATION_ACTION.JOB_OUTPUTS_SYNCED,
          ].includes(notification.action)
        )
      } catch (e) {
        return false
      }
    },
  })

  useEffect(() => {
    if (lastJsonMessage == null) {
      return
    }
    queryCache.invalidateQueries({
      queryKey: ['jobs'],
    })
  }, [lastJsonMessage])

  const selectedFileObjects = getSelectedObjectsFromIndexes(selectedIndexes, data?.jobs)
  const actions = useExecutionActions({ homeScope, selectedItems: selectedFileObjects, resourceKeys: ['jobs'] })

  if (error) return <div>Error! {JSON.stringify(error)}</div>

  return (
    <ErrorBoundary>
      <ResourceHeader>
        <ActionsRow>
          <div />
          <Dropdown
            trigger="click"
            content={
              <ActionsDropdownContent
                actions={actions}
                message={homeScope === 'spaces' && 'To perform other actions on this file, access it from the Space'}
              />
            }
          >
            {dropdownProps => (
              <ActionsButton {...dropdownProps} data-testid="home-executions-actions-button" active={dropdownProps.isActive} />
            )}
          </Dropdown>
        </ActionsRow>
      </ResourceHeader>

      <ExecutionsListTable
        isAdmin={isAdmin}
        homeScope={homeScope}
        setFilters={setSearchFilter}
        // TODO(samuel) Typescript fix
        filters={toArrayFromObject(filterQuery as any)}
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
      {actions['Snapshot']?.modal}
      {actions['Terminate']?.modal}
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
