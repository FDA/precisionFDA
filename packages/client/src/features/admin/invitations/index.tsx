import { useQueryClient } from '@tanstack/react-query'
import { Column, ColumnDef } from '@tanstack/react-table'
import axios from 'axios'
import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import useWebSocket from 'react-use-websocket'
import { HoverDNAnexusLogo } from '../../../components/icons/DNAnexusLogo'
import { Done, Failed, Runnable, Running } from '../../../components/icons/StateIcons'
import { UsersIcon } from '../../../components/icons/UsersIcon'
import { ContentFooter } from '../../../components/Page/ContentFooter'
import { hidePagination, Pagination } from '../../../components/Pagination'
import Table from '../../../components/Table'
import DateTimeRangeFilter, { dateRangeFilterFn } from '../../../components/Table/components/DateTimeRangeFilter'
import SelectFilter, { selectFilterFn } from '../../../components/Table/components/SelectFilter'
import { selectColumnDef } from '../../../components/Table/selectColumnDef'
import { useToastWSHandler } from '../../../hooks/useToastWSHandler'
import { UserLayout } from '../../../layouts/UserLayout'
import { DEFAULT_RECONNECT_ATTEMPTS, DEFAULT_RECONNECT_INTERVAL, getNodeWsUrl, SHOULD_RECONNECT } from '../../../utils/config'
import { convertDateToUserTime } from '../../../utils/datetime'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '../../../utils/object'
import { IFilter, MetaV2, Notification, NOTIFICATION_ACTION, WEBSOCKET_MESSAGE_TYPE, WebSocketMessage } from '../../home/types'
import { useList } from '../../home/useList'
import { Params, prepareListFetchV2 } from '../../home/utils'
import {
  AdminSectionBreadcrumbDivider,
  AdminSectionBreadcrumbs,
  AdminStyledPageTable,
  StateLabel,
  Title,
  Topbox,
  TopLeft,
} from '../styles'
import InvitationActionRow from './ActionRow'
import { Invitation, InvitationsListType } from './types'

const fetchInvitations = async (filters: IFilter[], params: Params) => {
  const queryParam = prepareListFetchV2(filters, params)
  return axios
    .get<InvitationsListType>('/api/v2/admin/invitations', { params: new URLSearchParams(queryParam) })
    .then(r => r.data)
}

const ProvisionStateCell = ({ provisionState }: { provisionState: string }) => {
  const icon = {
    finished: <Done />,
    failed: <Failed />,
    in_progress: <Running />,
    pending: <Runnable />,
  } as Record<string, React.ReactNode>
  const label = {
    finished: 'Finished',
    failed: 'Failed',
    in_progress: 'In Progress',
    pending: 'Pending',
  } as Record<string, string>
  return (
    <StateLabel>
      {icon[provisionState]}
      {label[provisionState]}
    </StateLabel>
  )
}

const getInvitationColumns = (): ColumnDef<Invitation>[] => [
  selectColumnDef<Invitation>(),
  {
    header: 'First Name',
    accessorKey: 'firstName',
    filterFn: 'includesString',
    enableSorting: false,
  },
  {
    header: 'Last Name',
    accessorKey: 'lastName',
    filterFn: 'includesString',
    enableSorting: false,
  },
  {
    header: 'Email',
    accessorKey: 'email',
    filterFn: 'includesString',
    enableSorting: false,
  },
  {
    header: 'Provisioning State',
    accessorKey: 'provisioningState',
    filterFn: selectFilterFn,
    enableSorting: false,
    meta: {
      filterElement: (column: Column<Invitation>) => (
        <SelectFilter
          column={column}
          options={[
            { label: 'Pending', option: 'pending' },
            { label: 'In Progress', option: 'in_progress' },
            { label: 'Finished', option: 'finished' },
            { label: 'Failed', option: 'failed' },
          ]}
        />
      ),
    },
    cell: props => <ProvisionStateCell provisionState={props.row.original.provisioningState} />,
  },
  {
    header: 'DUNS',
    accessorKey: 'duns',
    enableColumnFilter: false,
    enableSorting: false,
  },
  {
    header: 'Requested At',
    accessorKey: 'createdAt',
    filterFn: dateRangeFilterFn,
    enableSorting: false,
    meta: {
      filterElement: (column: Column<Invitation>) => <DateTimeRangeFilter column={column} />,
    },
    cell: c => <span>{convertDateToUserTime(c.row.original.createdAt).toString()}</span>,
  },
]

type ListType = { data: Invitation[]; meta: MetaV2 }

export const InvitationsList = () => {
  const {
    setPerPageParam,
    setPageParam,
    setSearchFilter,
    filterQuery,
    perPageParam,
    sortBy,
    setSortBy,
    query,
    selectedIndexes,
    setSelectedIndexes,
    saveColumnResizeWidth,
    colWidths,
  } = useList<ListType>({
    fetchList: fetchInvitations,
    resource: 'admin-invitations',
    params: {},
  })
  const queryClient = useQueryClient()
  const columns = getInvitationColumns()
  const { data, isLoading } = query
  if (query.error) {
    return <div>{JSON.stringify(query.error)}</div>
  }

  const selectedObjects = getSelectedObjectsFromIndexes(selectedIndexes, data?.data)
  const filters = toArrayFromObject(filterQuery)

  useToastWSHandler()

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
          [NOTIFICATION_ACTION.USER_PROVISIONED, NOTIFICATION_ACTION.USER_PROVISIONING_COMPLETED].includes(notification.action)
        )
      } catch {
        return false
      }
    },
  })

  useEffect(() => {
    if (lastJsonMessage == null) {
      return
    }
    queryClient.invalidateQueries({
      queryKey: ['admin-invitations'],
    })
  }, [lastJsonMessage])

  return (
    <UserLayout innerScroll>
      <AdminSectionBreadcrumbs>
        <Link to="/admin" data-turbolinks="false">
          Admin Dashboard
        </Link>
        <AdminSectionBreadcrumbDivider>/</AdminSectionBreadcrumbDivider>
        <Link to="/admin/users" data-turbolinks="false">
          Users
        </Link>
        <AdminSectionBreadcrumbDivider>/</AdminSectionBreadcrumbDivider>
        <Link to="/admin/invitations" data-turbolinks="false">
          Provision new users
        </Link>
      </AdminSectionBreadcrumbs>
      <Topbox>
        <TopLeft>
          <UsersIcon height={20} />
          <Title>Invitation Management</Title>
        </TopLeft>
        <InvitationActionRow selectedInvitations={selectedObjects} />
      </Topbox>

      <AdminStyledPageTable>
        <Table<Invitation>
          isLoading={isLoading}
          data={data?.data ?? []}
          columns={columns}
          columnSizing={colWidths}
          setColumnSizing={saveColumnResizeWidth}
          rowSelection={selectedIndexes}
          setSelectedRows={setSelectedIndexes}
          setColumnFilters={setSearchFilter}
          columnSortBy={sortBy}
          setColumnSortBy={setSortBy}
          columnFilters={filters}
        />
      </AdminStyledPageTable>

      <ContentFooter>
        <Pagination
          page={data?.meta?.page}
          totalCount={data?.meta?.total}
          totalPages={data?.meta?.totalPages}
          perPage={perPageParam}
          isHidden={hidePagination(query.isFetched, data?.data?.length, data?.meta?.totalPages)}
          setPage={setPageParam as (n: number) => void}
          onPerPageSelect={setPerPageParam as (n: number) => void}
          showListCount
        />
        <HoverDNAnexusLogo opacity height={14} />
      </ContentFooter>
    </UserLayout>
  )
}
