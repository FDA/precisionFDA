import { Column, ColumnDef } from '@tanstack/react-table'
import React from 'react'
import { Link } from 'react-router'
import styled from 'styled-components'
import { DEFAULT_PAGINATED_DATA } from '../../../api/types'
import { HoverDNAnexusLogo } from '../../../components/icons/DNAnexusLogo'
import { UsersIcon } from '../../../components/icons/UserIcon'
import { ContentFooter } from '../../../components/Page/ContentFooter'
import { hidePagination, Pagination } from '../../../components/Pagination'
import Table from '../../../components/Table'
import DateTimeRangeFilter, { dateRangeFilterFn } from '../../../components/Table/components/DateTimeRangeFilter'
import SelectFilter, { selectFilterFn } from '../../../components/Table/components/SelectFilter'
import { selectColumnDef } from '../../../components/Table/selectColumnDef'
import { usePageMeta } from '../../../hooks/usePageMeta'
import { UserLayout } from '../../../layouts/UserLayout'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '../../../utils/object'
import { useList } from '../../home/useList'
import { formatNumberUS } from '../../home/utils'
import { AdminSectionBreadcrumbDivider, AdminSectionBreadcrumbs, AdminStyledPageTable, Title, Topbox, TopLeft } from '../styles'
import { fetchUsers } from './api'
import { UsersListActionRow } from './ListPageActionRow'
import { AdminUserListType, User } from './types'

const StyledLinkCell = styled.a`
  display: flex;
  align-items: center;
  gap: 5px;
`

const UserLinkCell = ({ dxuser, children }: { dxuser: string; children: React.ReactNode }) => (
  <StyledLinkCell data-turbolinks="false" href={`/users/${dxuser}`}>
    {children}
  </StyledLinkCell>
)

const USER_STATUS_OPTIONS = [
  { label: 'Active', option: 0 },
  { label: 'Locked', option: 1 },
  { label: 'Deactivated', option: 2 },
]

const formatLastLogin = (lastLogin: string | null) => {
  if (!lastLogin) return null

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
    cell: ({ row }) => <UserLinkCell dxuser={row.original.dxuser}>{row.original.dxuser}</UserLinkCell>,
  },
  {
    header: 'Email ID',
    accessorKey: 'email',
    filterFn: 'includesString',
    size: 300,
    cell: ({ row }) => <UserLinkCell dxuser={row.original.dxuser}>{row.original.email}</UserLinkCell>,
  },
  {
    header: 'Last Login Date',
    accessorKey: 'lastLogin',
    filterFn: dateRangeFilterFn,
    meta: {
      filterElement: (column: Column<User>) => <DateTimeRangeFilter column={column} />,
    },
    size: 300,
    cell: ({ row }) => <UserLinkCell dxuser={row.original.dxuser}>{formatLastLogin(row.original.lastLogin)}</UserLinkCell>,
  },
  {
    header: 'Status',
    accessorKey: 'userState',
    filterFn: selectFilterFn,
    meta: {
      filterElement: (column: Column<User>) => <SelectFilter column={column} options={USER_STATUS_OPTIONS} />,
    },
    size: 250,
    cell: ({ row }) => <UserLinkCell dxuser={row.original.dxuser}>{row.original.userState.toUpperCase()}</UserLinkCell>,
  },
  {
    header: 'Total Limit',
    accessorKey: 'cloudResourceSettings.total_limit',
    id: 'totalLimit',
    size: 250,
    enableColumnFilter: false,
    cell: ({ row }) => (
      <UserLinkCell dxuser={row.original.dxuser}>
        {row.original.cloudResourceSettings?.total_limit
          ? `$${formatNumberUS(row.original.cloudResourceSettings?.total_limit)}`
          : 'N/A'}
      </UserLinkCell>
    ),
  },
  {
    header: 'Job Limit',
    id: 'jobLimit',
    accessorKey: 'cloudResourceSettings.job_limit',
    enableColumnFilter: false,
    size: 250,
    cell: ({ row }) => (
      <UserLinkCell dxuser={row.original.dxuser}>
        {row.original.cloudResourceSettings?.job_limit
          ? `$${formatNumberUS(row.original.cloudResourceSettings?.job_limit)}`
          : 'N/A'}
      </UserLinkCell>
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
  } = useList<AdminUserListType>({
    fetchList: fetchUsers,
    resource: 'admin-users',
    params: {},
  })

  const { data = DEFAULT_PAGINATED_DATA, isLoading, error } = query

  if (error) {
    return <div>{JSON.stringify(error)}</div>
  }

  const columns = getAdminUserColumns()
  const selectedUsers = getSelectedObjectsFromIndexes(selectedIndexes, data.data)
  const filters = toArrayFromObject(filterQuery)

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
      </AdminSectionBreadcrumbs>

      <Topbox>
        <TopLeft>
          <UsersIcon height={20} />
          <Title>User Management</Title>
        </TopLeft>
        <UsersListActionRow selectedUsers={selectedUsers} refetchUsers={query.refetch} />
      </Topbox>

      <AdminStyledPageTable>
        <Table<User>
          isLoading={isLoading}
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
        />
      </AdminStyledPageTable>

      <ContentFooter>
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
      </ContentFooter>
    </UserLayout>
  )
}

export default UsersList
