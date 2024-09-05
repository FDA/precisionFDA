import { useQueryClient } from '@tanstack/react-query'
import React, { useEffect, useMemo, useState } from 'react'
import { SortingRule, UseResizeColumnsState } from 'react-table'
import useWebSocket from 'react-use-websocket'
import { ContentFooter } from '../../components/Page/ContentFooter'
import { Pagination, hidePagination } from '../../components/Pagination'
import Table from '../../components/Table/Table'
import { EmptyTable } from '../../components/Table/styles'
import { useColumnWidthLocalStorage } from '../../hooks/useColumnWidthLocalStorage'
import { useOrderByState } from '../../hooks/useOrderByState'
import { usePaginationParams } from '../../hooks/usePaginationState'
import { ErrorBoundary } from '../../utils/ErrorBoundry'
import { DEFAULT_RECONNECT_ATTEMPTS, DEFAULT_RECONNECT_INTERVAL, SHOULD_RECONNECT, getNodeWsUrl } from '../../utils/config'
import { toArrayFromObject } from '../../utils/object'
import { IExecution } from '../executions/executions.types'
import { useExecutionColumns } from '../executions/useExecutionColumns'
import { columnFilters } from '../home/columnFilters'
import { StyledHomeTable } from '../home/home.styles'
import {
  IFilter,
  IMeta,
  KeyVal,
  NOTIFICATION_ACTION,
  Notification,
  WEBSOCKET_MESSSAGE_TYPE,
  WebSocketMessage,
} from '../home/types'
import { useFilterParams } from '../home/useFilterState'
import { useListQuery } from '../home/useListQuery'
import { fetchAppExecutions } from './apps.api'

type ListType = { jobs: IExecution[]; meta: IMeta }

export const AppExecutionsList = ({ appUid }: { appUid: string }) => {
  const resource = 'app-executions'
  const { pageParam, perPageParam, setPageParam, setPerPageParam } = usePaginationParams()
  const { sort, sortBy, setSortBy } = useOrderByState({ defaultOrder: { order_by: 'created_at_date_time', order_dir: 'DESC' } })
  const { colWidths, saveColumnResizeWidth } = useColumnWidthLocalStorage(resource)
  const queryCache = useQueryClient()
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
      queryKey: [resource],
    })
  }, [lastJsonMessage])

  const { isLoading, data, error } = query

  if (error) return <div>Error! {JSON.stringify(error)}</div>

  return (
    <ErrorBoundary>
      <ExecutionsListTable
        setFilters={setSearchFilter}
        // TODO(samuel) fix possibly undefined values from querystring
        filters={toArrayFromObject(filterQuery as any)}
        jobs={data?.jobs}
        isLoading={isLoading}
        setSortBy={setSortBy}
        sortBy={sortBy}
        saveColumnResizeWidth={saveColumnResizeWidth}
        colWidths={colWidths}
      />
      <ContentFooter>
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
      </ContentFooter>
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
  saveColumnResizeWidth: (columnResizing: UseResizeColumnsState<any>['columnResizing']) => void
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
