import { USER_STATE } from '@shared/domain/user/user.entity'
import { SpaceMembership } from '../space-membership.entity'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE } from '../space-membership.enum'

export class SpaceMemberDTO {
  id: number
  active: boolean
  createdAt: Date
  role: keyof typeof SPACE_MEMBERSHIP_ROLE
  side: keyof typeof SPACE_MEMBERSHIP_SIDE
  name: string
  username: string
  userActive: boolean
  domain?: string

  static fromEntity(membership: SpaceMembership): SpaceMemberDTO {
    return {
      id: membership.id,
      active: membership.active,
      createdAt: membership.createdAt,
      role: SPACE_MEMBERSHIP_ROLE[membership.role] as keyof typeof SPACE_MEMBERSHIP_ROLE,
      side: SPACE_MEMBERSHIP_SIDE[membership.side] as keyof typeof SPACE_MEMBERSHIP_SIDE,
      name: membership.user.getEntity().fullName,
      username: membership.user.getEntity().dxuser,
      userActive: membership.user.getEntity().userState === USER_STATE.ENABLED,
    }
  }
}
