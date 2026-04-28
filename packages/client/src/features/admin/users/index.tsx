import type { Column, ColumnDef } from '@tanstack/react-table'
import React from 'react'
import styled from 'styled-components'
import { DEFAULT_PAGINATED_DATA } from '../../../api/types'
import { HoverDNAnexusLogo } from '../../../components/icons/DNAnexusLogo'
import { hidePagination, Pagination } from '../../../components/Pagination'
import Table from '../../../components/Table'
import DateTimeRangeFilter, { dateRangeFilterFn } from '../../../components/Table/components/DateTimeRangeFilter'
import SelectFilter, { selectFilterFn } from '../../../components/Table/components/SelectFilter'
import { selectColumnDef } from '../../../components/Table/selectColumnDef'
import { usePageMeta } from '../../../hooks/usePageMeta'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '../../../utils/object'
import { useList } from '../../home/useList'
import { formatNumberUS } from '../../home/utils'
import { AdminContentFooter, AdminStyledPageTable, Title, Topbox } from '../styles'
import { AdminTablePlaceholderLoader, getAdminTableLoadingState } from '../tableLoading'
import { AdminUserDetailsDrawer } from './AdminUserDetailsDrawer'
import { fetchUsers } from './api'
import { UsersListActionRow } from './ListPageActionRow'
import type { AdminUserListType, User } from './types'

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
    size: 250,
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
  const [openedUserId, setOpenedUserId] = React.useState<User['id'] | null>(null)

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

  const { data = DEFAULT_PAGINATED_DATA, isLoading, error } = query
  const { showLoadingState, showPlaceholderLoader, tableClassName } = getAdminTableLoadingState({
    data: query.data,
    isLoading,
    isFetching: query.isFetching,
    isPlaceholderData: query.isPlaceholderData,
  })

  React.useEffect(() => {
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
  const filters = toArrayFromObject(filterQuery)

  return (
    <>
      <Topbox>
        <Title>User Management</Title>
        <UsersListActionRow selectedUsers={selectedUsers} refetchUsers={query.refetch} />
      </Topbox>

      <div className="relative flex flex-1 min-h-0 flex-col">
        {showPlaceholderLoader && <AdminTablePlaceholderLoader />}
        <AdminStyledPageTable className={tableClassName}>
          <Table<User>
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
            columnSortBy={sortBy}
            setColumnSortBy={setSortBy}
            columnFilters={filters}
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

export default UsersList
