import type { User } from '../../user/user.entity'

export class ProfileUserDTO {
  id: number
  dxuser: string
  firstName: string
  lastName: string
  email: string
  fullName: string
  timeZone: string | null
  singular: boolean
  canProvisionAccounts: boolean
  isOrgAdmin: boolean

  static fromEntity(user: User, singular: boolean, isOrgAdmin: boolean): ProfileUserDTO {
    const dto = new ProfileUserDTO()
    dto.id = user.id
    dto.dxuser = user.dxuser
    dto.firstName = user.firstName
    dto.lastName = user.lastName
    dto.email = user.email
    dto.fullName = user.fullName
    dto.timeZone = user.timeZone ?? null
    dto.singular = singular
    dto.canProvisionAccounts = isOrgAdmin
    dto.isOrgAdmin = isOrgAdmin
    return dto
  }
}
