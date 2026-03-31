import type { IFile } from '../files/files.types'
import type { MemberRole } from './members/members.types'
import type { ISpace, SpaceType } from './spaces.types'

export const CONTRIBUTOR_OR_HIGHER_ROLES: MemberRole[] = ['lead', 'admin', 'contributor']

export const SpaceTypeName = {
  groups: 'Group',
  review: 'Review',
  private_type: 'Private',
  government: 'Government',
  administrator: 'Administrator',
} as Record<ISpace['type'], string>

export const getHostLeadLabel = (type: SpaceType): string => {
  if (type === 'review') {
    return 'Reviewer Lead'
  }
  if (type === 'groups') {
    return 'Host Lead'
  }
  return ''
}

export const getGuestLeadLabel = (type: SpaceType): string => {
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
export const isActionDisabledBasedOnRole = (userId?: number, space?: ISpace): boolean => {
  if (!space) {
    return false
  }
  return !(space.host_lead?.id === userId || space.guest_lead?.id === userId)
}

/**
 * Disable action if space is protected and current user is not lead.
 */
export const isActionDisabledBasedOnProtected = (userId?: number, space?: ISpace): boolean => {
  if (!space?.protected) {
    return false
  }
  return isActionDisabledBasedOnRole(userId, space)
}

export const isActionDisabledBasedOnLocked = (files: IFile[], userId?: number, space?: ISpace): boolean => {
  if (files.every(file => !file.locked)) {
    return false
  }
  return isActionDisabledBasedOnRole(userId, space)
}

export const isContributorOrHigherRole = (role: MemberRole): boolean => {
  if (!role) {
    return false
  }

  return CONTRIBUTOR_OR_HIGHER_ROLES.includes(role)
}
