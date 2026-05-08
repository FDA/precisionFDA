import type { ColumnDef } from '@tanstack/react-table'
import { AdminRoleBadge } from './AdminRoleBadge'
import styles from './memberships.module.css'
import { ADMIN_GROUP_ROLES, ROLE_LABELS, type UserWithAdminRoles } from './types'

export function useAdminRoleColumns(): ColumnDef<UserWithAdminRoles>[] {
  return [
    {
      header: 'Username',
      accessorKey: 'dxuser',
      filterFn: 'includesString',
      enableResizing: false,
      size: 260,
    },
    {
      header: 'Email',
      accessorKey: 'email',
      filterFn: 'includesString',
      enableResizing: false,
      size: 290,
    },
    {
      header: ROLE_LABELS[ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN],
      id: 'roleSiteAdmin',
      enableColumnFilter: false,
      enableSorting: false,
      enableResizing: false,
      size: 120,
      cell: ({ row }) => (
        <div className={styles.roleCell}>
          <AdminRoleBadge
            user={row.original}
            role={ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN}
            isRootAdmin={row.original.isRootAdmin}
          />
        </div>
      ),
    },
    {
      header: ROLE_LABELS[ADMIN_GROUP_ROLES.ROLE_REVIEW_SPACE_ADMIN],
      id: 'roleSpaceAdmin',
      enableColumnFilter: false,
      enableSorting: false,
      enableResizing: false,
      size: 140,
      cell: ({ row }) => (
        <div className={styles.roleCell}>
          <AdminRoleBadge
            user={row.original}
            role={ADMIN_GROUP_ROLES.ROLE_REVIEW_SPACE_ADMIN}
            isRootAdmin={row.original.isRootAdmin}
          />
        </div>
      ),
    },
    {
      header: ROLE_LABELS[ADMIN_GROUP_ROLES.ROLE_CHALLENGE_ADMIN],
      id: 'roleChallengeAdmin',
      enableColumnFilter: false,
      enableSorting: false,
      enableResizing: false,
      size: 160,
      cell: ({ row }) => (
        <div className={styles.roleCell}>
          <AdminRoleBadge
            user={row.original}
            role={ADMIN_GROUP_ROLES.ROLE_CHALLENGE_ADMIN}
            isRootAdmin={row.original.isRootAdmin}
          />
        </div>
      ),
    },
    {
      header: ROLE_LABELS[ADMIN_GROUP_ROLES.ROLE_CHALLENGE_EVALUATOR],
      id: 'roleChallengeEvaluator',
      enableColumnFilter: false,
      enableSorting: false,
      enableResizing: false,
      size: 180,
      cell: ({ row }) => (
        <div className={styles.roleCell}>
          <AdminRoleBadge
            user={row.original}
            role={ADMIN_GROUP_ROLES.ROLE_CHALLENGE_EVALUATOR}
            isRootAdmin={row.original.isRootAdmin}
          />
        </div>
      ),
    },
  ]
}
