import type { User } from '../user.entity'
import { serializeUserState } from '../user.helper'

export class UserBasicInfoDTO {
  id: number
  dxuser: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  userState: 'active' | 'deactivated' | 'locked' | 'n/a'
  createdAt: Date
  updatedAt: Date
  timeZone: string | null
  organization: {
    id: number
    name: string
    handle: string
    adminId: number | null
    adminFullName: string | null
    singular: boolean
  }

  static fromEntity(user: User): UserBasicInfoDTO {
    const dto = new UserBasicInfoDTO()
    const organization = user.organization.getEntity()
    const organizationAdmin = organization.admin ? organization.admin.getEntity() : null

    dto.id = user.id
    dto.dxuser = user.dxuser
    dto.firstName = user.firstName
    dto.lastName = user.lastName
    dto.fullName = user.fullName
    dto.email = user.email
    dto.userState = serializeUserState(user.userState)
    dto.createdAt = user.createdAt
    dto.updatedAt = user.updatedAt
    dto.timeZone = user.timeZone ?? null
    dto.organization = {
      id: organization.id,
      name: organization.name,
      handle: organization.handle,
      adminId: organizationAdmin?.id ?? null,
      adminFullName: organizationAdmin?.fullName ?? null,
      singular: organization.singular,
    }
    return dto
  }
}
