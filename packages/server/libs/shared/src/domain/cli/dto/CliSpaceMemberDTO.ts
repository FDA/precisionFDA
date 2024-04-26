import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'

export class CliSpaceMemberDTO {
  id: number
  active: boolean
  createdAt: Date
  role: keyof typeof SPACE_MEMBERSHIP_ROLE
  side: keyof typeof SPACE_MEMBERSHIP_SIDE
  name: string
  username: string

  static async mapToDTO(membership: SpaceMembership): Promise<CliSpaceMemberDTO> {
    await membership.user.load()
    return {
      id: membership.id,
      active: membership.active,
      createdAt: membership.createdAt,
      role: SPACE_MEMBERSHIP_ROLE[membership.role] as keyof typeof SPACE_MEMBERSHIP_ROLE,
      side: SPACE_MEMBERSHIP_SIDE[membership.side] as keyof typeof SPACE_MEMBERSHIP_SIDE,
      name: membership.user.getEntity().fullName,
      username: membership.user.getEntity().dxuser,

    }

  }
}
