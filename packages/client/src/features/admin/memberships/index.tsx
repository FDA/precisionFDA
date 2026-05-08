import { FilterChips } from '@/components/FilterChips'
import Table from '@/components/Table'
import { usePageMeta } from '@/hooks/usePageMeta'
import { toArrayFromObject } from '@/utils/object'
import { useList } from '../../home/useList'
import { AdminListPage } from '../AdminListPage'
import { AdminUserDetailsDrawer } from '../users/AdminUserDetailsDrawer'
import { useOpenedUser } from '../users/useOpenedUser'
import { fetchUsersWithRoles } from './api'
import styles from './memberships.module.css'
import {
  ADMIN_GROUP_ROLES,
  type AdminRole,
  ROLE_LABELS,
  type UserWithAdminRoles,
  type UserWithAdminRolesListType,
} from './types'
import { useAdminRoleColumns } from './useAdminRoleColumns'

const CHIP_ROLES: AdminRole[] = [
  ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN,
  ADMIN_GROUP_ROLES.ROLE_REVIEW_SPACE_ADMIN,
  ADMIN_GROUP_ROLES.ROLE_CHALLENGE_ADMIN,
  ADMIN_GROUP_ROLES.ROLE_CHALLENGE_EVALUATOR,
]

const AdminMembershipsPage = () => {
  usePageMeta({ title: 'precisionFDA Admin - Memberships' })

  const {
    setPerPageParam,
    setPageParam,
    setSearchFilter,
    setFilterParam,
    filterQuery,
    perPageParam,
    sortBy,
    setSortBy,
    query,
  } = useList<UserWithAdminRolesListType>({
    fetchList: fetchUsersWithRoles,
    resource: 'admin-memberships',
  })

  const rows = (query?.data?.data ?? []) as UserWithAdminRoles[]
  const { openedUserId, openUser, closeUser } = useOpenedUser(rows, query.isLoading)
  const columns = useAdminRoleColumns()
  const filters = toArrayFromObject(filterQuery)

  const activeRole = filterQuery.role != null ? (Number(filterQuery.role) as AdminRole) : null
  const setRoleFilter = (role: AdminRole | null) => setFilterParam({ role: role ?? undefined })

  const chips = [
    {
      key: 'all',
      label: 'All',
      active: activeRole === null,
      onClick: () => setRoleFilter(null),
    },
    ...CHIP_ROLES.map(role => ({
      key: role,
      label: ROLE_LABELS[role],
      active: activeRole === role,
      onClick: () => setRoleFilter(role),
    })),
  ]

  return (
    <>
      <AdminListPage
        title="Admin Memberships"
        actions={<FilterChips aria-label="Filter by role" chips={chips} />}
        query={query}
        perPage={perPageParam}
        setPage={setPageParam as (n: number) => void}
        setPerPage={setPerPageParam as (n: number) => void}
        tableClassName={styles.membershipsTable}
      >
        {({ isLoading }) => (
          <Table<UserWithAdminRoles>
            isLoading={isLoading}
            data={rows}
            columns={columns}
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

export default AdminMembershipsPage
