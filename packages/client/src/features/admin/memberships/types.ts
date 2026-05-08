import type { MetaV2 } from '../../home/types'

export const ADMIN_GROUP_ROLES = {
  ROLE_SITE_ADMIN: 0,
  ROLE_REVIEW_SPACE_ADMIN: 1,
  ROLE_CHALLENGE_ADMIN: 2,
  ROLE_CHALLENGE_EVALUATOR: 3,
} as const

export type AdminRole = (typeof ADMIN_GROUP_ROLES)[keyof typeof ADMIN_GROUP_ROLES]

export const ROLE_LABELS: Record<AdminRole, string> = {
  [ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN]: 'Site Admin',
  [ADMIN_GROUP_ROLES.ROLE_REVIEW_SPACE_ADMIN]: 'Space Admin',
  [ADMIN_GROUP_ROLES.ROLE_CHALLENGE_ADMIN]: 'Challenge Admin',
  [ADMIN_GROUP_ROLES.ROLE_CHALLENGE_EVALUATOR]: 'Challenge Evaluator',
}

export interface UserWithAdminRoles {
  id: number
  dxuser: string
  email: string
  firstName: string
  lastName: string
  adminRoles: AdminRole[]
  adminMembershipIds: Record<AdminRole, number | null>
  isRootAdmin: boolean
}

export type UserWithAdminRolesListType = { data: UserWithAdminRoles[]; meta: MetaV2 }
