import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { Space } from '@shared/domain/space/space.entity'
import { User } from '@shared/domain/user/user.entity'
import { isAdminOrLead } from '../space-membership/space-membership.helper'
import { SPACE_STATE, SPACE_TYPE } from './space.enum'
import { isAcceptedBy } from './space.helper'

class SpaceActionPolicy {
  canAccept(space: Space, confidentialSpaces: Space[], spaceMembership: SpaceMembership): boolean {
    return space && spaceMembership && isAdminOrLead(spaceMembership.role) && !isAcceptedBy(space, confidentialSpaces, spaceMembership)
  }

  async canLock(space: Space, user: User): Promise<boolean> {
    const isRSA = await user.isReviewSpaceAdmin()

    return space
      && space.state === SPACE_STATE.ACTIVE
      && (!space.isConfidential() && space.type === SPACE_TYPE.REVIEW)
      && isRSA
  }

  async canUnlock(space: Space, user: User): Promise<boolean> {
    const isRSA = await user.isReviewSpaceAdmin()

    return space
      && space.state === SPACE_STATE.LOCKED
      && (!space.isConfidential() && space.type === SPACE_TYPE.REVIEW)
      && isRSA
  }
}


const spaceActionPolicy = new SpaceActionPolicy()

export { spaceActionPolicy }

