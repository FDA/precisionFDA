import { useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { useEffect } from 'react'
import Table from '@/components/Table'
import { useLastWSNotification } from '@/hooks/useLastWSNotification'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '@/utils/object'
import { type IFilter, NOTIFICATION_ACTION } from '../../home/types'
import { useList } from '../../home/useList'
import { type Params, prepareListFetchV2 } from '../../home/utils'
import { AdminListPage } from '../AdminListPage'
import { fetchInvitations, type Invitation } from '../users/api'
import InvitationActionRow from './ActionRow'
import type { InvitationListType } from './types'

const fetchInvitationsList = async (filters: IFilter[], params: Params) => {
  const filterParam = prepareListFetchV2(filters, params) as Record<string, string>
  if (params.ids) {
    filterParam['filter[ids]'] = params.ids as string
  }
  return fetchInvitations({
    params: new URLSearchParams(filterParam),
  })
}

export const InvitationsTable = ({
  title,
  additionalParams,
  columns,
}: {
  title: string
  additionalParams?: Record<string, string>
  columns: ColumnDef<Invitation>[]
}) => {
  const {
    setPerPageParam,
    setPageParam,
    setSearchFilter,
    filterQuery,
    perPageParam,
    query,
    selectedIndexes,
    setSelectedIndexes,
    saveColumnResizeWidth,
    colWidths,
    columnVisibility,
    setColumnVisibility,
  } = useList<InvitationListType>({
    fetchList: fetchInvitationsList,
    resource: 'admin-invitations',
    params: {
      ...additionalParams,
    },
  })

  const rows = query?.data?.data ?? []
  const selectedObjects = getSelectedObjectsFromIndexes(selectedIndexes, rows)
  const filters = toArrayFromObject(filterQuery)
  const queryClient = useQueryClient()

  const lastJsonMessage = useLastWSNotification([
    NOTIFICATION_ACTION.USER_PROVISIONING_DONE,
    NOTIFICATION_ACTION.USER_PROVISIONING_ERROR,
    NOTIFICATION_ACTION.ALL_USER_PROVISIONINGS_COMPLETED,
  ])

  useEffect(() => {
    if (lastJsonMessage == null) {
      return
    }
    void queryClient.invalidateQueries({
      queryKey: ['admin-invitations'],
    })
  }, [lastJsonMessage, queryClient])

  return (
    <AdminListPage
      title={title}
      actions={<InvitationActionRow selectedInvitations={selectedObjects} setSelectedIndexes={setSelectedIndexes} />}
      query={query}
      perPage={perPageParam}
      setPage={setPageParam as (n: number) => void}
      setPerPage={setPerPageParam as (n: number) => void}
    >
      {({ isLoading }) => (
        <Table<Invitation>
          isLoading={isLoading}
          data={rows}
          columns={columns}
          columnSizing={colWidths}
          setColumnSizing={saveColumnResizeWidth}
          columnVisibility={columnVisibility}
          setColumnVisibility={setColumnVisibility}
          rowSelection={selectedIndexes}
          setSelectedRows={setSelectedIndexes}
          setColumnFilters={setSearchFilter}
          columnFilters={filters}
          emptyText="No invitations found"
        />
      )}
    </AdminListPage>
  )
}
