import { ISpace } from './spaces.types'

export const SpaceTypeName = {
  groups: 'Group',
  review: 'Review',
  private_type: 'Private',
  government: 'Government',
  administrator: 'Administrator',
}

export const getHostLeadLabel = (type: ISpace['type']) => {
  if (type === 'review') {
    return 'Reviewer Lead'
  }
  if (type === 'groups') {
    return 'Host Lead'
  }
  return ''
}

export const getGuestLeadLabel = (type: ISpace['type']) => {
  if (type === 'review') {
    return 'Reviewer Lead'
  }
  if (type === 'groups') {
    return 'Guest Lead'
  }
  return ''
}

/**
 * Disable action if current user is not a space lead.
 */
export const isActionDisabledBasedOnRole = (
  authUserId?: number,
  space?: ISpace,
) => {
  if (!space) {
    return false
  }
  if (
    space.host_lead?.id === authUserId ||
    space.guest_lead?.id === authUserId
  ) {
    return false
  }
  return true
}

/**
 * Disable action if space is protected and current user is not lead.
 */
export const isActionDisabledBasedOnProtected = (
  authUserId?: number,
  space?: ISpace,
) => {
  if (!space?.protected) {
    return false
  }
  return isActionDisabledBasedOnRole(authUserId, space)
}
