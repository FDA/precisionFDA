import { Space } from '@shared/domain/space/space.entity'
import { SPACE_STATE, SPACE_TYPE } from '@shared/domain/space/space.enum'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'

export class SpaceListItemDTO {
  id: number
  name: string
  description: string
  type: string
  hidden: boolean
  protected: boolean
  restrictedReviewer: boolean
  state: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  guestLead: string
  hostLead: string
  currentUserMembership: SpaceMembership

  static async fromEntity(space: Space, userId: number): Promise<SpaceListItemDTO> {
    return {
      id: space.id,
      name: space.name,
      description: space.description,
      type: SPACE_TYPE[space.type].toLowerCase(),
      hidden: space.hidden,
      protected: space.protected,
      restrictedReviewer: space.meta?.restricted_reviewer === true,
      state: SPACE_STATE[space.state].toLowerCase(),
      tags: space.taggings.map(tagging => tagging.tag.name),
      createdAt: space.createdAt,
      updatedAt: space.updatedAt,
      guestLead: (await space.findGuestLead())?.fullName,
      hostLead: (await space.findHostLead())?.fullName,
      currentUserMembership: space.spaceMemberships.find(
        spaceMembership => spaceMembership.user.id === userId && spaceMembership.active,
      ),
    }
  }
}
