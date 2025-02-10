import { User } from '@shared/domain/user/user.entity'

// this can be extended if you need more information about the user (like admin controllers)
export class SimpleUserDTO {
  id: number
  dxuser: string
  firstName: string
  lastName: string
  fullName: string

  static fromEntity(user: User): SimpleUserDTO {
    const userDTO = new SimpleUserDTO()
    userDTO.id = user.id
    userDTO.dxuser = user.dxuser
    userDTO.firstName = user.firstName
    userDTO.lastName = user.lastName
    userDTO.fullName = user.fullName
    return userDTO
  }
}
