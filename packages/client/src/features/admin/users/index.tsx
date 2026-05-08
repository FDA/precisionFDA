import type { Column, ColumnDef } from '@tanstack/react-table'
import styled from 'styled-components'
import Table from '@/components/Table'
import DateTimeRangeFilter, { dateRangeFilterFn } from '@/components/Table/components/DateTimeRangeFilter'
import SelectFilter, { selectFilterFn } from '@/components/Table/components/SelectFilter'
import { selectColumnDef } from '@/components/Table/selectColumnDef'
import { usePageMeta } from '@/hooks/usePageMeta'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '@/utils/object'
import { useList } from '../../home/useList'
import { formatNumberUS } from '../../home/utils'
import { AdminListPage } from '../AdminListPage'
import { AdminUserDetailsDrawer } from './AdminUserDetailsDrawer'
import { fetchUsers } from './api'
import { UsersListActionRow } from './ListPageActionRow'
import type { AdminUserListType, User } from './types'
import { useOpenedUser } from './useOpenedUser'

const StyledCell = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`

const USER_STATUS_OPTIONS = [
  { label: 'Active', option: 0 },
  { label: 'Locked', option: 1 },
  { label: 'Deactivated', option: 2 },
]

const formatLastLogin = (lastLogin: string | null) => {
  if (!lastLogin) return 'N/A'

  return new Date(lastLogin).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour12: true,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  })
}

const getAdminUserColumns = (): ColumnDef<User>[] => [
  selectColumnDef<User>(),
  {
    header: 'Username',
    accessorKey: 'dxuser',
    filterFn: 'includesString',
    size: 200,
    cell: ({ row }) => <StyledCell>{row.original.dxuser}</StyledCell>,
  },
  {
    header: 'Email ID',
    accessorKey: 'email',
    filterFn: 'includesString',
    size: 300,
    cell: ({ row }) => <StyledCell>{row.original.email}</StyledCell>,
  },
  {
    header: 'Last Login Date',
    accessorKey: 'lastLogin',
    filterFn: dateRangeFilterFn,
    meta: {
      filterElement: (column: Column<User>) => <DateTimeRangeFilter column={column} />,
    },
    size: 300,
    cell: ({ row }) => <StyledCell>{formatLastLogin(row.original.lastLogin)}</StyledCell>,
  },
  {
    header: 'Status',
    accessorKey: 'userState',
    filterFn: selectFilterFn,
    meta: {
      filterElement: (column: Column<User>) => <SelectFilter column={column} options={USER_STATUS_OPTIONS} />,
    },
    size: 270,
    cell: ({ row }) => <StyledCell>{row.original.userState.toUpperCase()}</StyledCell>,
  },
  {
    header: 'Total Limit',
    accessorKey: 'cloudResourceSettings.total_limit',
    id: 'totalLimit',
    size: 250,
    enableColumnFilter: false,
    cell: ({ row }) => (
      <StyledCell>
        {typeof row.original.cloudResourceSettings?.total_limit === 'number'
          ? `$${formatNumberUS(row.original.cloudResourceSettings?.total_limit)}`
          : 'N/A'}
      </StyledCell>
    ),
  },
  {
    header: 'Job Limit',
    id: 'jobLimit',
    accessorKey: 'cloudResourceSettings.job_limit',
    enableColumnFilter: false,
    size: 250,
    cell: ({ row }) => (
      <StyledCell>
        {typeof row.original.cloudResourceSettings?.job_limit === 'number'
          ? `$${formatNumberUS(row.original.cloudResourceSettings?.job_limit)}`
          : 'N/A'}
      </StyledCell>
    ),
  },
]

const UsersList = () => {
  usePageMeta({ title: 'precisionFDA Admin - Users' })

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
    columnVisibility,
    setColumnVisibility,
  } = useList<AdminUserListType>({
    fetchList: fetchUsers,
    resource: 'admin-users',
    params: {},
  })

  const rows = query?.data?.data ?? []
  const { openedUserId, openUser, closeUser } = useOpenedUser(rows, query.isLoading)

  const columns = getAdminUserColumns()
  const selectedUsers = getSelectedObjectsFromIndexes(selectedIndexes, rows)
  const filters = toArrayFromObject(filterQuery)

  return (
    <>
      <AdminListPage
        title="User Management"
        actions={<UsersListActionRow selectedUsers={selectedUsers} refetchUsers={query.refetch} />}
        query={query}
        perPage={perPageParam}
        setPage={setPageParam as (n: number) => void}
        setPerPage={setPerPageParam as (n: number) => void}
      >
        {({ isLoading }) => (
          <Table<User>
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
            columnSortBy={sortBy}
            setColumnSortBy={setSortBy}
            columnFilters={filters}
            onRowClick={row => openUser(row.original.id)}
          />
        )}
      </AdminListPage>

      <AdminUserDetailsDrawer userId={openedUserId} open={openedUserId != null} onClose={closeUser} />
    </>
  )
}

export default UsersList
