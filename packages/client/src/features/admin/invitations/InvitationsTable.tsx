import { useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { useEffect } from 'react'
import { DEFAULT_PAGINATED_DATA } from '../../../api/types'
import { HoverDNAnexusLogo } from '../../../components/icons/DNAnexusLogo'
import { hidePagination, Pagination } from '../../../components/Pagination'
import Table from '../../../components/Table'
import { useLastWSNotification } from '../../../hooks/useLastWSNotification'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '../../../utils/object'
import { type IFilter, NOTIFICATION_ACTION } from '../../home/types'
import { useList } from '../../home/useList'
import { type Params, prepareListFetchV2 } from '../../home/utils'
import { AdminContentFooter, AdminStyledPageTable, Title, Topbox, TopLeft } from '../styles'
import { AdminTablePlaceholderLoader, getAdminTableLoadingState } from '../tableLoading'
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
  const { data = DEFAULT_PAGINATED_DATA, isLoading } = query
  const { showLoadingState, showPlaceholderLoader, tableClassName } = getAdminTableLoadingState({
    data: query.data,
    isLoading,
    isFetching: query.isFetching,
    isPlaceholderData: query.isPlaceholderData,
  })
  const selectedObjects = getSelectedObjectsFromIndexes(selectedIndexes, data.data)
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

  if (query.error) {
    return <div>{JSON.stringify(query.error)}</div>
  }

  return (
    <>
      <Topbox>
        <TopLeft>
          <Title>{title}</Title>
        </TopLeft>
        <InvitationActionRow selectedInvitations={selectedObjects} setSelectedIndexes={setSelectedIndexes} />
      </Topbox>

      <div className="relative flex flex-1 min-h-0 flex-col">
        {showPlaceholderLoader && <AdminTablePlaceholderLoader />}
        <AdminStyledPageTable className={tableClassName}>
          <Table<Invitation>
            isLoading={showLoadingState}
            data={data.data}
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
        </AdminStyledPageTable>
      </div>

      <AdminContentFooter>
        <Pagination
          page={data.meta.page}
          totalCount={data.meta.total}
          totalPages={data.meta.totalPages}
          perPage={perPageParam}
          isHidden={hidePagination(query.isFetched, data.data.length, data.meta.totalPages)}
          setPage={setPageParam as (n: number) => void}
          onPerPageSelect={setPerPageParam as (n: number) => void}
          showListCount
        />
        <HoverDNAnexusLogo opacity height={14} />
      </AdminContentFooter>
    </>
  )
}
