import type { ColumnDef } from '@tanstack/react-table'
import type React from 'react'
import { Link } from 'react-router'
import { useResendActivationEmailMutation } from '@/api/mutations/user'
import { DEFAULT_PAGINATED_DATA } from '@/api/types'
import { Button } from '@/components/Button'
import { HoverDNAnexusLogo } from '@/components/icons/DNAnexusLogo'
import { UsersIcon } from '@/components/icons/UserIcon'
import { ContentFooter } from '@/components/Page/ContentFooter'
import { hidePagination, Pagination } from '@/components/Pagination'
import { selectColumnDef } from '@/components/Table/selectColumnDef'
import { usePageMeta } from '@/hooks/usePageMeta'
import { UserLayout } from '@/layouts/UserLayout'
import { formatDate } from '@/utils/formatting'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '@/utils/object'
import Table from '../../../components/Table'
import { useList } from '../../home/useList'
import { ButtonsRow } from '../common'
import { fetchPendingUsers, type PendingUser, type PendingUserListType } from './api'
import styles from './pendingUsers.module.css'

const UserLinkCell = ({ dxuser, children }: { dxuser: string; children: React.ReactNode }) => (
  <a className={styles.linkCell} data-turbolinks="false" href={`/users/${dxuser}`}>
    {children}
  </a>
)

const getAdminUserColumns = (): ColumnDef<PendingUser>[] => [
  selectColumnDef<PendingUser>(),
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
    enableColumnFilter: false,
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
  } = useList<PendingUserListType>({
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
      <div className={styles.breadcrumbs}>
        <Link to="/admin" data-turbolinks="false">
          Admin Dashboard
        </Link>
        <span className={styles.breadcrumbDivider}>/</span>
        <Link to="/admin/users" data-turbolinks="false">
          Pending Users
        </Link>
      </div>

      <div className={styles.topbox}>
        <div className={styles.topLeft}>
          <UsersIcon height={20} />
          <div className={styles.title}>Pending Users Management</div>
        </div>
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
      </div>

      <div className={styles.pageTable}>
        <Table<PendingUser>
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
          enableColumnSelect={false}
        />
      </div>

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
