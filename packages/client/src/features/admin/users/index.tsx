import { Column, ColumnDef } from '@tanstack/react-table'
import axios from 'axios'
import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
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
import { IUser } from '../../../types/user'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '../../../utils/object'
import { IFilter, MetaV2 } from '../../home/types'
import { useList } from '../../home/useList'
import { Params, prepareListFetchV2 } from '../../home/utils'
import { AdminSectionBreadcrumbDivider, AdminSectionBreadcrumbs, AdminStyledPageTable, Title, Topbox, TopLeft } from '../styles'
import { UsersListActionRow } from './ListPageActionRow'
import { User } from './types'

type AdminUserListType = { data: User[]; meta: MetaV2 }

export async function fetchUsers(filters: IFilter[], params: Params) {
  const query = prepareListFetchV2(filters, params)
  const paramQ = `?${new URLSearchParams(query as {}).toString()}`
  return axios.get<AdminUserListType>(`/api/v2/admin/users/${paramQ}`).then(r => r.data)
}

export const StyledLinkCell = styled.a`
  display: flex;
  align-items: center;
  gap: 5px;
`

export const getAdminUserColumns = (): ColumnDef<User>[] => [
  selectColumnDef<User>(),
  {
    header: 'Username',
    accessorKey: 'dxuser',
    filterFn: 'includesString',
    size: 198,
    cell: c => (
      <StyledLinkCell data-turbolinks="false" href={`/users/${c.row.original.dxuser}`}>
        {c.row.original.dxuser}
      </StyledLinkCell>
    ),
  },
  {
    header: 'Email ID',
    accessorKey: 'email',
    filterFn: 'includesString',
    size: 300,
    cell: c => (
      <StyledLinkCell data-turbolinks="false" href={`/users/${c.row.original.dxuser}`}>
        {c.row.original.email}
      </StyledLinkCell>
    ),
  },
  {
    header: 'Login Date',
    accessorKey: 'lastLogin',
    filterFn: dateRangeFilterFn,
    meta: {
      filterElement: (column: Column<IUser>) => <DateTimeRangeFilter column={column} />,
    },
    size: 320,
    cell: c => {
      return (
        <StyledLinkCell data-turbolinks="false" href={`/users/${c.row.original.dxuser}`}>
          {c.row.original.lastLogin &&
            new Date(c.row.original.lastLogin).toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
              hour12: true,
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric',
            })}
        </StyledLinkCell>
      )
    },
  },
  {
    header: 'Status',
    accessorKey: 'userState',
    filterFn: selectFilterFn,
    meta: {
      filterElement: (column: Column<User>) => (
        <SelectFilter
          column={column}
          options={[
            { label: 'Active', option: 0 },
            { label: 'Locked', option: 1 },
            { label: 'Deactivated', option: 2 },
          ]}
        />
      ),
    },
    size: 300,
    cell: c => (
      <StyledLinkCell data-turbolinks="false" href={`/users/${c.row.original.dxuser}`}>
        {c.row.original.userState.toUpperCase()}
      </StyledLinkCell>
    ),
  },
  {
    header: 'Total Limit',
    accessorKey: 'cloudResourceSettings.total_limit',
    id: 'totalLimit',
    size: 300,
    enableColumnFilter: false,
    cell: props => (
      <StyledLinkCell data-turbolinks="false" href={`/users/${props.row.original.dxuser}`}>
        {`$${props.row.original.cloudResourceSettings.total_limit}`}
      </StyledLinkCell>
    ),
  },
  {
    header: 'Job Limit',
    id: 'jobLimit',
    accessorKey: 'cloudResourceSettings.job_limit',
    enableColumnFilter: false,
    size: 300,
    cell: c => (
      <StyledLinkCell data-turbolinks="false" href={`/users/${c.row.original.dxuser}`}>
        {`$${c.row.original.cloudResourceSettings.job_limit}`}
      </StyledLinkCell>
    ),
  },
]

type ListType = { apps: IUser[]; meta: MetaV2 }

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
  } = useList<ListType>({
    fetchList: fetchUsers,
    resource: 'admin-users',
    params: {},
  })

  const columns = getAdminUserColumns()
  const { data, isLoading } = query
  if (query.error) {
    return <div>{JSON.stringify(query.error)}</div>
  }

  const selectedObjects = getSelectedObjectsFromIndexes(selectedIndexes, data?.data)
  // console.log(filterQuery);

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
        <UsersListActionRow selectedUsers={selectedObjects} refetchUsers={query.refetch} />
      </Topbox>

      <AdminStyledPageTable>
        <Table<User>
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

export default UsersList
