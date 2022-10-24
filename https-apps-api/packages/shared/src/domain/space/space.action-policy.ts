import { Space, SpaceMembership } from '..'
import { isAdminOrLead } from '../space-membership/space-membership.helper'
import { User } from '../user'
import { SPACE_STATE, SPACE_TYPE } from './space.enum'
import { isAcceptedBy } from './space.helper'

class SpaceActionPolicy {
  canAccept(space: Space, confidentialSpaces: Space[], spaceMembership: SpaceMembership): boolean {
    return space && spaceMembership && isAdminOrLead(spaceMembership.role) && !isAcceptedBy(space, confidentialSpaces, spaceMembership)
  }

  async canLock(space: Space, user: User): Promise<boolean> {
    const isRSA = await user.isReviewSpaceAdmin()

    return space
      && space.state === SPACE_STATE.STATE_ACTIVE
      && (!space.isConfidential() && space.type === SPACE_TYPE.REVIEW)
      && isRSA
  }

  async canUnlock(space: Space, user: User): Promise<boolean> {
    const isRSA = await user.isReviewSpaceAdmin()

    return space
      && space.state === SPACE_STATE.STATE_LOCKED
      && (!space.isConfidential() && space.type === SPACE_TYPE.REVIEW)
      && isRSA
  }
}


const spaceActionPolicy = new SpaceActionPolicy()

export { spaceActionPolicy }

