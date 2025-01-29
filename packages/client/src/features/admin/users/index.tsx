// TODO(samuel) fix
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import axios from 'axios'
import React, { useMemo } from 'react'
import { CellProps, Column } from 'react-table'
import styled from 'styled-components'
import { StringParam, withDefault } from 'use-query-params'
import { HoverDNAnexusLogo } from '../../../components/icons/DNAnexusLogo'
import { UsersIcon } from '../../../components/icons/UserIcon'
import { ContentFooter } from '../../../components/Page/ContentFooter'
import { hidePagination, Pagination } from '../../../components/Pagination'
import {
  DateRangeColumnFilter,
  DefaultColumnFilter,
  NumberRangeColumnFilter,
  SelectColumnFilter,
} from '../../../components/Table/filters'
import { EmptyTable, ReactTableStyles } from '../../../components/Table/styles'
import Table from '../../../components/Table/Table'
import { useColumnWidthLocalStorage } from '../../../hooks/useColumnWidthLocalStorage'
import { useList } from '../../../hooks/useList'
import { usePageMeta } from '../../../hooks/usePageMeta'
import {
  FilterT,
  PaginationInput,
  prepareListFetch,
  SortInput,
} from '../../../utils/filters'
import { cleanObject, toArrayFromObject } from '../../../utils/object'
import { UserLayout } from '../../../layouts/UserLayout'
import { UsersListActionRow } from './ListPageActionRow'
import { User } from './types'
import { IUser } from '../../../types/user'
import { MetaV2 } from '../../home/types'

type AdminUserListType = { data: User[]; meta: MetaV2 }

// TODO(samuel) migrate definition of related fieds to server-side
const USERS_TABLE_KEYS = [
  'dxuser' as const,
  'email' as const,
  'lastLogin' as const,
  'userState' as const,
  'totalLimit' as const,
  'jobLimit' as const,
]

type UserTableCols = (typeof USERS_TABLE_KEYS)[number]

type UserFilter = FilterT<UserTableCols>
type UserSortInput = SortInput<UserTableCols>

export const fetchUsers = async (
  filters: UserFilter[],
  pagination: PaginationInput,
  order: Partial<UserSortInput>,
) => {
  const query = prepareListFetch(filters, pagination, order)
  const paramQ = `?${new URLSearchParams(cleanObject(query) as any).toString()}`
  return axios
    .get(`/api/v2/admin/users/${paramQ}`)
    .then(r => r.data as AdminUserListType)
}

export const StyledLinkCell = styled.a`
  display: flex;
  align-items: center;
  gap: 5px;
`

export const Title = styled.div`
  display: flex;
  font-size: 24px;
  font-weight: bold;
  align-items: center;
  margin: 16px 0;
  margin-right: 16px;
  margin-bottom: 8px;
  gap: 8px;
`

export const TopLeft = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
`

export const Topbox = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding-left: 32px;
  padding-right: 16px;
`

const StyledTable = styled.div`
  overflow-x: auto;
  overflow-y: auto;
  flex-grow: 1;
  height: 0;

  ${ReactTableStyles} {
    margin-inline: auto;
    /* width: min(100% - 32px, 100%); */
    font-size: 14px;
    .table {

      .tr {
        height: 56px;
        .td {
          position: relative;
          padding: 10px;
          height: auto;
          justify-content: flex-start;
          align-items: flex-start;
        }
      }
    }
  }
`

export const getAdminUserColumns = (colWidths: Record<string, number>) =>
  [
    {
      Header: 'Username',
      accessor: 'dxuser',
      Filter: DefaultColumnFilter,
      width: colWidths?.dxuser ?? 198,
      Cell: ({ value, row }: React.PropsWithChildren<CellProps<User>>) => (
        <StyledLinkCell
          data-turbolinks="false"
          href={`/users/${row.original.dxuser}`}
        >
          {value}
        </StyledLinkCell>
      ),
    },
    {
      Header: 'Email ID',
      accessor: 'email',
      Filter: DefaultColumnFilter,
      width: colWidths?.email ?? 300,
      Cell: ({ value, row }: React.PropsWithChildren<CellProps<User>>) => (
        <StyledLinkCell
          data-turbolinks="false"
          href={`/users/${row.original.dxuser}`}
        >
          {value}
        </StyledLinkCell>
      ),
    },
    {
      Header: 'Login Date',
      accessor: 'lastLogin',
      Filter: DateRangeColumnFilter,
      width: colWidths?.lastLogin ?? 320,
      Cell: ({ value, row }: React.PropsWithChildren<CellProps<User>>) => {
        return (
          <StyledLinkCell
            data-turbolinks="false"
            href={`/users/${row.original.dxuser}`}
          >
            {value &&
              new Date(value).toLocaleDateString('en-US', {
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
      Header: 'Status',
      accessor: 'userState',
      Filter: SelectColumnFilter,
      options: [
        { label: 'Active', value: 0 },
        { label: 'Locked', value: 1 },
        { label: 'Deactivated', value: 2 },
      ],
      width: colWidths?.lastLogin ?? 300,
      Cell: ({ value, row }: React.PropsWithChildren<CellProps<User>>) => (
        <StyledLinkCell
          data-turbolinks="false"
          href={`/users/${row.original.dxuser}`}
        >
          {value.toUpperCase()}
        </StyledLinkCell>
      ),
    },
    {
      Header: 'Total Limit',
      id: 'totalLimit',
      accessor: 'cloudResourceSettings.total_limit',
      Filter: NumberRangeColumnFilter,
      filterPlaceholderFrom: 'Min $',
      filterPlaceholderTo: 'Max $',
      width: colWidths?.lastLogin ?? 300,
      Cell: ({ value, row }: React.PropsWithChildren<CellProps<User>>) => (
        <StyledLinkCell
          data-turbolinks="false"
          href={`/users/${row.original.dxuser}`}
        >
          {`$${value}`}
        </StyledLinkCell>
      ),
    },
    {
      Header: 'Job Limit',
      id: 'jobLimit',
      accessor: 'cloudResourceSettings.job_limit',
      Filter: NumberRangeColumnFilter,
      width: colWidths?.lastLogin ?? 300,
      filterPlaceholderFrom: 'Min $',
      filterPlaceholderTo: 'Max $',
      Cell: ({ value, row }: React.PropsWithChildren<CellProps<User>>) => (
        <StyledLinkCell
          data-turbolinks="false"
          href={`/users/${row.original.dxuser}`}
        >
          {`$${value}`}
        </StyledLinkCell>
      ),
    },
  ] as Column<User>[]

const UsersList = () => {
  usePageMeta({ title: 'precisionFDA Admin - Users' })
  const {
    sortBy,
    setSortBy,
    setPerPageParam,
    setPageParam,
    setSearchFilter,
    filterQuery,
    perPageParam,
    query,
    selectedIndexes,
    setSelectedIndexes,
  } = useList<AdminUserListType, UserTableCols>({
    resource: 'users',
    fetchList: fetchUsers,
    allFields: USERS_TABLE_KEYS,
    filterQueryParams: {
      dxuser: withDefault(StringParam, undefined),
      email: withDefault(StringParam, undefined),
      lastLogin: withDefault(StringParam, undefined),
      userState: withDefault(StringParam, undefined),
      totalLimit: withDefault(StringParam, undefined),
      jobLimit: withDefault(StringParam, undefined),
    },
    defaultPerPage: 50,
  })
  const { colWidths, saveColumnResizeWidth } =
    useColumnWidthLocalStorage('users')
  const columns = useMemo(() => getAdminUserColumns(colWidths), [colWidths])
  const { data } = query
  if (query.error) {
    return <div>{JSON.stringify(query.error)}</div>
  }

  const filters = toArrayFromObject(filterQuery)
  return (
    <UserLayout innerScroll>
      <Topbox>
        <TopLeft>
          <UsersIcon height={20} />
          <Title>User Management</Title>
        </TopLeft>
        <UsersListActionRow
          selectedUsers={
            data?.data?.filter(user => selectedIndexes?.[user.id]) ?? []
          }
          refetchUsers={query.refetch}
        />
      </Topbox>

      <StyledTable>
        <Table<User>
          name="admin_users"
          columns={columns}
          hiddenColumns={[]}
          data={data?.data ?? []}
          isSelectable
          isSortable
          isFilterable
          loading={query.isLoading}
          loadingComponent={<div>Loading...</div>}
          selectedRows={selectedIndexes}
          setSelectedRows={setSelectedIndexes}
          sortByPreference={sortBy}
          setSortByPreference={setSortBy}
          manualFilters
          filters={filters}
          setFilters={setSearchFilter}
          emptyComponent={<EmptyTable>No users found</EmptyTable>}
          isColsResizable
          saveColumnResizeWidth={saveColumnResizeWidth}
          // TODO(samuel) fix - getRowId in table component not correctly typed
          getRowId={user => (user as IUser).id.toString()}
        />
      </StyledTable>

      <ContentFooter>
        <Pagination
          page={data?.meta?.page!}
          totalCount={data?.meta?.total!}
          totalPages={data?.meta?.totalPages!}
          perPage={perPageParam}
          isHidden={hidePagination(
            query.isFetched,
            data?.data?.length,
            data?.meta?.totalPages,
          )}
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
