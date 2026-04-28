import { USER_STATE, type User } from '../../user/user.entity'

export class OrgUserDTO {
  id: number
  dxuser: string
  fullName: string
  createdAt: string
  isEnabled: boolean
  isAdmin: boolean

  static fromEntity(user: User, adminId?: number): OrgUserDTO {
    const dto = new OrgUserDTO()
    dto.id = user.id
    dto.dxuser = user.dxuser
    dto.fullName = user.fullName
    dto.createdAt = user.createdAt.toISOString()
    dto.isEnabled = user.userState === USER_STATE.ENABLED
    dto.isAdmin = adminId !== undefined && user.id === adminId
    return dto
  }
}
