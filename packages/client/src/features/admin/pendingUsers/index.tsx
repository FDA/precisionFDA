import type { ColumnDef } from '@tanstack/react-table'
import { formatDistanceToNow } from 'date-fns'
import { useResendActivationEmailMutation } from '@/api/mutations/user'
import Table from '@/components/Table'
import { selectColumnDef } from '@/components/Table/selectColumnDef'
import { Button } from '@/components/ui/button'
import { usePageMeta } from '@/hooks/usePageMeta'
import { formatDate } from '@/utils/formatting'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '@/utils/object'
import { useList } from '../../home/useList'
import { AdminListPage } from '../AdminListPage'
import { ButtonsRow } from '../common'
import { AdminUserDetailsDrawer } from '../users/AdminUserDetailsDrawer'
import { useOpenedUser } from '../users/useOpenedUser'
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
  {
    header: 'Pending For',
    id: 'pendingFor',
    size: 160,
    enableColumnFilter: false,
    enableSorting: false,
    cell: ({ row }) => (
      <span title={formatDate(row.original.createdAt)}>
        {formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: false })}
      </span>
    ),
  },
]

const PendingUsersList = () => {
  usePageMeta({ title: 'precisionFDA Admin - Pending Users' })

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

  const rows = query?.data?.data ?? []
  const { openedUserId, openUser, closeUser } = useOpenedUser(rows, query.isLoading)
  const { mutate: resendActivationEmail } = useResendActivationEmailMutation()

  const columns = getAdminUserColumns()
  const selectedUsers = getSelectedObjectsFromIndexes(selectedIndexes, rows)
  const isSingleUserSelected = selectedUsers.length === 1
  const filters = toArrayFromObject(filterQuery)

  const handleResendActivation = () => {
    if (isSingleUserSelected) {
      resendActivationEmail(selectedUsers[0].id, {})
    }
  }

  return (
    <>
      <AdminListPage
        title="Pending Users"
        actions={
          <ButtonsRow>
            <Button
              data-testid="admin-users-activate-button"
              disabled={!isSingleUserSelected}
              onClick={handleResendActivation}
            >
              Resend Activation Email
            </Button>
          </ButtonsRow>
        }
        query={query}
        perPage={perPageParam}
        setPage={setPageParam as (n: number) => void}
        setPerPage={setPerPageParam as (n: number) => void}
      >
        {({ isLoading }) => (
          <Table<PendingUser>
            isLoading={isLoading}
            data={rows}
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
            onRowClick={row => openUser(row.original.id)}
          />
        )}
      </AdminListPage>

      <AdminUserDetailsDrawer userId={openedUserId} open={openedUserId != null} onClose={closeUser} />
    </>
  )
}

export default PendingUsersList
