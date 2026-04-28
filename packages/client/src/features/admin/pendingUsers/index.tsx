import type { ColumnDef } from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import { useResendActivationEmailMutation } from '@/api/mutations/user'
import { DEFAULT_PAGINATED_DATA } from '@/api/types'
import { HoverDNAnexusLogo } from '@/components/icons/DNAnexusLogo'
import { hidePagination, Pagination } from '@/components/Pagination'
import { selectColumnDef } from '@/components/Table/selectColumnDef'
import { Button } from '@/components/ui/button'
import { usePageMeta } from '@/hooks/usePageMeta'
import { formatDate } from '@/utils/formatting'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '@/utils/object'
import Table from '../../../components/Table'
import { useList } from '../../home/useList'
import { ButtonsRow } from '../common'
import { AdminContentFooter, AdminStyledPageTable, Title, Topbox } from '../styles'
import { AdminTablePlaceholderLoader, getAdminTableLoadingState } from '../tableLoading'
import { AdminUserDetailsDrawer } from '../users/AdminUserDetailsDrawer'
import type { User } from '../users/types'
import { fetchPendingUsers, type PendingUser, type PendingUserListType } from './api'

const getAdminUserColumns = (): ColumnDef<PendingUser>[] => [
  selectColumnDef<PendingUser>(),
  {
    header: 'Username',
    accessorKey: 'dxuser',
    filterFn: 'includesString',
    size: 400,
  },
  {
    header: 'Email ID',
    accessorKey: 'email',
    filterFn: 'includesString',
    size: 400,
  },
  {
    header: 'Created At',
    accessorKey: 'createdAt',
    size: 300,
    enableColumnFilter: false,
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
]

const PendingUsersList = () => {
  usePageMeta({ title: 'precisionFDA Admin - Pending Users' })
  const [openedUserId, setOpenedUserId] = useState<User['id'] | null>(null)

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
  } = useList<PendingUserListType>({
    fetchList: fetchPendingUsers,
    resource: 'admin-pending-users',
    params: {},
  })

  const { mutate: resendActivationEmail } = useResendActivationEmailMutation()
  const { data = DEFAULT_PAGINATED_DATA, isLoading, error } = query
  const { showLoadingState, showPlaceholderLoader, tableClassName } = getAdminTableLoadingState({
    data: query.data,
    isLoading,
    isFetching: query.isFetching,
    isPlaceholderData: query.isPlaceholderData,
  })

  useEffect(() => {
    if (openedUserId == null) return
    if (isLoading) return
    if (data.data.some(user => user.id === openedUserId)) return
    setOpenedUserId(null)
  }, [data.data, isLoading, openedUserId])

  if (error) {
    return <div>{JSON.stringify(error)}</div>
  }

  const columns = getAdminUserColumns()
  const selectedUsers = getSelectedObjectsFromIndexes(selectedIndexes, data.data)
  const isSingleUserSelected = selectedUsers.length === 1
  const filters = toArrayFromObject(filterQuery)

  const handleResendActivation = () => {
    if (isSingleUserSelected) {
      resendActivationEmail(selectedUsers[0].id, {})
    }
  }

  return (
    <>
      <Topbox>
        <Title>Pending Users</Title>
        <ButtonsRow>
          <Button
            size="sm"
            data-testid="admin-users-activate-button"
            disabled={!isSingleUserSelected}
            onClick={handleResendActivation}
          >
            Resend Activation Email
          </Button>
        </ButtonsRow>
      </Topbox>

      <div className="relative flex flex-1 min-h-0 flex-col">
        {showPlaceholderLoader && <AdminTablePlaceholderLoader />}
        <AdminStyledPageTable className={tableClassName}>
          <Table<PendingUser>
            isLoading={showLoadingState}
            data={data.data}
            columns={columns}
            columnSizing={colWidths}
            setColumnSizing={saveColumnResizeWidth}
            rowSelection={selectedIndexes}
            setSelectedRows={setSelectedIndexes}
            setColumnFilters={setSearchFilter}
            columnSortBy={sortBy}
            setColumnSortBy={setSortBy}
            columnFilters={filters}
            enableColumnSelect={false}
            onRowClick={row => setOpenedUserId(row.original.id)}
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

      <AdminUserDetailsDrawer userId={openedUserId} open={openedUserId != null} onClose={() => setOpenedUserId(null)} />
    </>
  )
}

export default PendingUsersList
