import { User } from '@shared/domain/user/user.entity'

export class PendingUserDTO {
  id: number
  dxuser: string
  email: string
  createdAt: Date

  static fromEntity(user: User): PendingUserDTO {
    const dto = new PendingUserDTO()
    dto.id = user.id
    dto.dxuser = user.dxuser
    dto.email = user.email
    dto.createdAt = user.createdAt
    return dto
  }
}
