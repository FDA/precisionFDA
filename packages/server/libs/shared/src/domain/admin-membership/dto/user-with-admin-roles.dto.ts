import { config } from '@shared/config'
import { ADMIN_GROUP_ROLES } from '@shared/domain/admin-group/admin-group.entity'
import { User } from '@shared/domain/user/user.entity'

export class UserWithAdminRolesDTO {
  id: number
  dxuser: string
  email: string
  firstName: string
  lastName: string
  adminRoles: ADMIN_GROUP_ROLES[]
  adminMembershipIds: Record<number, number | null>
  isRootAdmin: boolean

  static fromEntity(user: User): UserWithAdminRolesDTO {
    const adminRoles: ADMIN_GROUP_ROLES[] = []
    const adminMembershipIds = Object.fromEntries(
      Object.values(ADMIN_GROUP_ROLES)
        .filter((v): v is ADMIN_GROUP_ROLES => typeof v === 'number')
        .map(role => [role, null]),
    ) as Record<ADMIN_GROUP_ROLES, number | null>

    for (const membership of user.adminMemberships.getItems()) {
      const role = membership.adminGroup.getEntity().role
      adminRoles.push(role)
      adminMembershipIds[role] = membership.id
    }

    return {
      id: user.id,
      dxuser: user.dxuser,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      adminRoles,
      adminMembershipIds,
      isRootAdmin: user.dxuser === config.platform.adminUser,
    }
  }
}
