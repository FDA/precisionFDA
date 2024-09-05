import { useQueryClient } from '@tanstack/react-query'
import React, { useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Column, SortingRule, UseResizeColumnsState } from 'react-table'
import useWebSocket from 'react-use-websocket'
import Dropdown from '../../components/Dropdown'
import { ContentFooter } from '../../components/Page/ContentFooter'
import { Pagination } from '../../components/Pagination'
import Table from '../../components/Table/Table'
import { EmptyTable } from '../../components/Table/styles'
import { HoverDNAnexusLogo } from '../../components/icons/DNAnexusLogo'
import { ErrorBoundary } from '../../utils/ErrorBoundry'
import { DEFAULT_RECONNECT_ATTEMPTS, DEFAULT_RECONNECT_INTERVAL, SHOULD_RECONNECT, getNodeWsUrl } from '../../utils/config'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '../../utils/object'
import { useAuthUser } from '../auth/useAuthUser'
import { ActionsDropdownContent } from '../home/ActionDropdownContent'
import {
  ActionsRow, StyledHomeTable,
} from '../home/home.styles'
import { ActionsButton, ResourceHeader } from '../home/show.styles'
import { HomeScope, IFilter, IMeta, KeyVal, NOTIFICATION_ACTION, Notification, WEBSOCKET_MESSSAGE_TYPE, WebSocketMessage } from '../home/types'
import { useList } from '../home/useList'
import { usePropertiesQuery } from '../home/usePropertiesQuery'
import { ExecutionSubTable } from './ExecutionSubTable'
import { fetchExecutions } from './executions.api'
import { IExecution } from './executions.types'
import { useExecutionColumns } from './useExecutionColumns'
import { useExecutionActions } from './useExecutionSelectActions'

type ListType = { jobs: IExecution[]; meta: IMeta }

export const ExecutionList = ({ homeScope, spaceId }: { homeScope?: HomeScope; spaceId?: string }) => {
  const navigate = useNavigate()
  const user = useAuthUser()
  const isAdmin = user?.isAdmin

  const onRowClick = (uid: string) => navigate(`/home/executions/${uid}`)
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
    hiddenColumns,
    saveHiddenColumns,
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
          messageData.type === WEBSOCKET_MESSSAGE_TYPE.NOTIFICATION &&
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
  const actions = useExecutionActions({ homeScope, selectedItems: selectedFileObjects, resourceKeys: ['jobs']})

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
      {actions['Attach to...']?.modal}
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
  saveColumnResizeWidth,
  colWidths,
  hiddenColumns,
  saveHiddenColumns,
}: {
  isAdmin?: boolean
  filters: IFilter[]
  jobs?: IExecution[]
  properties?: string[]
  setFilters: (val: IFilter[]) => void
  selectedRows?: Record<string, boolean>
  setSelectedRows: (ids: Record<string, boolean>) => void
  sortBy?: SortingRule<string>[]
  setSortBy: (cols: SortingRule<string>[]) => void
  isLoading: boolean
  homeScope?: HomeScope
  colWidths: KeyVal
  saveColumnResizeWidth: (columnResizing: UseResizeColumnsState<any>['columnResizing']) => void
  saveHiddenColumns: (cols: string[]) => void
  hiddenColumns: string[]
}) => {
  const location = useLocation()
  function filterColsByScope(c: Column<IExecution>): boolean {
    // Check if any of the conditions is true, then hide the column
    return !(
      // If the homeScope is 'me', hide 'added_by' regardless of other conditions.
      (
        (homeScope === 'me' && c.accessor === 'added_by') ||
        // Hide 'location' for all homeScopes except 'spaces'.
        (homeScope !== 'spaces' && c.accessor === 'location') ||
        // Hide 'featured' for all homeScopes except 'everybody'.
        (homeScope !== 'everybody' && c.accessor === 'featured') ||
        c.accessor === 'created_at_date_time' ||
        c.accessor === 'workflow_title'
      )
    )
  }

  const col = useExecutionColumns({ colWidths, isAdmin, properties }).filter(filterColsByScope)

  const columns = useMemo(() => col, [col, location.search, properties])

  const data = useMemo(() => jobs || [], [jobs])

  return (
    <StyledHomeTable>
      <Table<IExecution>
        name="jobs"
        columns={columns}
        enableColumnSelect
        hiddenColumns={hiddenColumns}
        saveHiddenColumns={saveHiddenColumns}
        data={data}
        properties={properties}
        isSelectable
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
        emptyComponent={<EmptyTable>You have no executions here.</EmptyTable>}
        isColsResizable
        isSortable
        isFilterable
        saveColumnResizeWidth={saveColumnResizeWidth}
        isExpandable
        rowProps={row => ({
          className: 'hideExpand',
        })}
        updateRowState={row => ({
          ...row,
          hideExpand: !row.original.jobs,
        })}
        subcomponent={ExecutionSubTable}
      />
    </StyledHomeTable>
  )
}
