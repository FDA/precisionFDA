import { Space } from '@shared/domain/space/space.entity'
import { SPACE_STATE, SPACE_TYPE } from '@shared/domain/space/space.enum'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE } from '@shared/domain/space-membership/space-membership.enum'

export class CliListSpaceDTO {
  id: number
  title: string
  type: string
  state: string
  protected: boolean
  role: string | null
  side: string | null

  // membership may be undefined for site admins: SpaceRepository.getAccessibleWhere()
  // grants visibility to all spaces including ones they have no membership in.
  static fromEntity(space: Space, membership?: SpaceMembership): CliListSpaceDTO {
    return {
      id: space.id,
      title: space.name,
      type: SPACE_TYPE[space.type].toLowerCase(),
      state: SPACE_STATE[space.state].toLowerCase(),
      protected: space.protected ?? false,
      role: membership ? SPACE_MEMBERSHIP_ROLE[membership.role].toLowerCase() : null,
      side: membership ? SPACE_MEMBERSHIP_SIDE[membership.side].toLowerCase() : null,
    }
  }
}
