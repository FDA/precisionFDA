import { ADMIN_GROUP_ROLES } from '@shared/domain/admin-group/admin-group.entity'
import type { User } from '../user.entity'

const serializeUserState = (userState: User['userState']): AdminUserDetailsDTO['userState'] => {
  switch (userState) {
    case 0:
      return 'active'
    case 1:
      return 'locked'
    case 2:
      return 'deactivated'
    default:
      return 'n/a'
  }
}

export class AdminUserDetailsDTO {
  id: number
  dxuser: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  userState: 'active' | 'deactivated' | 'locked' | 'n/a'
  createdAt: Date
  updatedAt: Date
  lastLogin: Date | null
  timeZone: string | null
  disableMessage: string | null
  cloudResourceSettings: User['cloudResourceSettings'] | null
  organization: {
    id: number
    name: string
    handle: string
    adminId: number | null
    adminFullName: string | null
    singular: boolean
  }
  permissions: {
    isGovernmentUser: boolean
    isOrgAdmin: boolean
    isSiteAdmin: boolean
    isReviewSpaceAdmin: boolean
    isChallengeAdmin: boolean
    pendingActivation: boolean
  }

  static fromEntity(user: User): AdminUserDetailsDTO {
    const dto = new AdminUserDetailsDTO()
    const organization = user.organization.getEntity()
    const organizationAdmin = organization.admin ? organization.admin.getEntity() : null
    const adminRoles = new Set(
      user.adminMemberships.getItems().map(adminMembership => adminMembership.adminGroup.getEntity().role),
    )

    dto.id = user.id
    dto.dxuser = user.dxuser
    dto.firstName = user.firstName
    dto.lastName = user.lastName
    dto.fullName = user.fullName
    dto.email = user.email
    dto.userState = serializeUserState(user.userState)
    dto.createdAt = user.createdAt
    dto.updatedAt = user.updatedAt
    dto.lastLogin = user.lastLogin ?? null
    dto.timeZone = user.timeZone ?? null
    dto.disableMessage = user.disableMessage ?? null
    dto.cloudResourceSettings = user.cloudResourceSettings ?? null
    dto.organization = {
      id: organization.id,
      name: organization.name,
      handle: organization.handle,
      adminId: organizationAdmin?.id ?? null,
      adminFullName: organizationAdmin?.fullName ?? null,
      singular: organization.singular,
    }
    dto.permissions = {
      isGovernmentUser: user.isGovUser(),
      isOrgAdmin: organizationAdmin?.id === user.id,
      isSiteAdmin: adminRoles.has(ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN),
      isReviewSpaceAdmin: adminRoles.has(ADMIN_GROUP_ROLES.ROLE_REVIEW_SPACE_ADMIN),
      isChallengeAdmin: adminRoles.has(ADMIN_GROUP_ROLES.ROLE_CHALLENGE_ADMIN),
      pendingActivation: user.privateFilesProject == null,
    }

    return dto
  }
}
