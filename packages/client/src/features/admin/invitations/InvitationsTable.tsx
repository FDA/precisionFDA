import { ColumnDef } from '@tanstack/react-table'
import React, { useEffect } from 'react'
import { ContentFooter } from '../../../components/Page/ContentFooter'
import { hidePagination, Pagination } from '../../../components/Pagination'
import Table from '../../../components/Table'
import { HoverDNAnexusLogo } from '../../../components/icons/DNAnexusLogo'
import { UsersIcon } from '../../../components/icons/UsersIcon'
import { useLastWSNotification } from '../../../hooks/useLastWSNotification'
import { UserLayout } from '../../../layouts/UserLayout'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '../../../utils/object'
import { IFilter, NOTIFICATION_ACTION } from '../../home/types'
import { useList } from '../../home/useList'
import { Params, prepareListFetchV2 } from '../../home/utils'
import Breadcrumbs, { BreadcrumbItem } from '../Breadcrumbs'
import { AdminStyledPageTable, Title, Topbox, TopLeft } from '../styles'
import InvitationActionRow from './ActionRow'
import { InvitationListType } from './types'
import { useQueryClient } from '@tanstack/react-query'
import { fetchInvitations, Invitation } from '../users/api'

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
  breadcrumbs,
  title,
  additionalParams,
  columns,
}: {
  breadcrumbs: BreadcrumbItem[]
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
  } = useList<InvitationListType>({
    fetchList: fetchInvitationsList,
    resource: 'admin-invitations',
    params: {
      ...additionalParams,
    },
  })
  const { data, isLoading } = query
  if (query.error) {
    return <div>{JSON.stringify(query.error)}</div>
  }

  const selectedObjects = getSelectedObjectsFromIndexes(selectedIndexes, data?.data)
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
    queryClient.invalidateQueries({
      queryKey: ['admin-invitations'],
    })
  }, [lastJsonMessage])

  return (
    <UserLayout innerScroll>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <Topbox>
        <TopLeft>
          <UsersIcon height={20} />
          <Title>{title}</Title>
        </TopLeft>
        <InvitationActionRow selectedInvitations={selectedObjects} setSelectedIndexes={setSelectedIndexes} />
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
          columnFilters={filters}
          emptyText="No invitations found"
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
