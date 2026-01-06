import { ColumnDef } from '@tanstack/react-table'
import React from 'react'
import { Link } from 'react-router'
import styled from 'styled-components'
import { HoverDNAnexusLogo } from '../../../components/icons/DNAnexusLogo'
import { UsersIcon } from '../../../components/icons/UserIcon'
import { ContentFooter } from '../../../components/Page/ContentFooter'
import { hidePagination, Pagination } from '../../../components/Pagination'
import Table from '../../../components/Table'
import { selectColumnDef } from '../../../components/Table/selectColumnDef'
import { usePageMeta } from '../../../hooks/usePageMeta'
import { UserLayout } from '../../../layouts/UserLayout'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '../../../utils/object'
import { useList } from '../../home/useList'
import { AdminSectionBreadcrumbDivider, AdminSectionBreadcrumbs, AdminStyledPageTable, Title, Topbox, TopLeft } from '../styles'
import { AdminUserListType, User } from '../users/types'
import { fetchPendingUsers } from './api'
import { ButtonsRow } from '../common'
import { Button } from '../../../components/Button'
import { useResendActivationEmailMutation } from '../../../api/mutations/user'
import { formatDate } from '../../../utils/formatting'
import { DEFAULT_PAGINATED_DATA } from '../../../api/types'

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

const getAdminUserColumns = (): ColumnDef<User>[] => [
  selectColumnDef<User>(),
  {
    header: 'Username',
    accessorKey: 'dxuser',
    filterFn: 'includesString',
    size: 400,
    cell: ({ row }) => <UserLinkCell dxuser={row.original.dxuser}>{row.original.dxuser}</UserLinkCell>,
  },
  {
    header: 'Email ID',
    accessorKey: 'email',
    filterFn: 'includesString',
    size: 400,
    cell: ({ row }) => <UserLinkCell dxuser={row.original.dxuser}>{row.original.email}</UserLinkCell>,
  },
  {
    header: 'Created At',
    accessorKey: 'createdAt',
    size: 300,
    cell: ({ row }) => formatDate(row.original.createdAt),
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
  } = useList<AdminUserListType>({
    fetchList: fetchPendingUsers,
    resource: 'admin-users',
    params: {},
  })

  const { mutate: resendActivationEmail } = useResendActivationEmailMutation()
  const { data = DEFAULT_PAGINATED_DATA, isLoading, error } = query

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
    <UserLayout innerScroll>
      <AdminSectionBreadcrumbs>
        <Link to="/admin" data-turbolinks="false">
          Admin Dashboard
        </Link>
        <AdminSectionBreadcrumbDivider>/</AdminSectionBreadcrumbDivider>
        <Link to="/admin/users" data-turbolinks="false">
          Pending Users
        </Link>
      </AdminSectionBreadcrumbs>

      <Topbox>
        <TopLeft>
          <UsersIcon height={20} />
          <Title>Pending Users Management</Title>
        </TopLeft>
        <ButtonsRow>
          <Button
            data-variant="primary"
            data-testid="admin-users-activate-button"
            disabled={!isSingleUserSelected}
            onClick={handleResendActivation}
          >
            Resend Activation Email
          </Button>
        </ButtonsRow>
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

export default PendingUsersList
