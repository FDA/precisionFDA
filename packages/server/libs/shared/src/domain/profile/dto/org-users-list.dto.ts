import type { User } from '../../user/user.entity'
import { OrgUserDTO } from './org-user.dto'

export class OrgUsersListDTO {
  users: OrgUserDTO[]
  totalCount: number

  static fromEntities(users: User[], adminId?: number): OrgUsersListDTO {
    const dto = new OrgUsersListDTO()
    dto.users = users.map(user => OrgUserDTO.fromEntity(user, adminId))
    dto.totalCount = dto.users.length
    return dto
  }
}
