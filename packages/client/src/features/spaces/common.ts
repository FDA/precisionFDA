import { IFile } from '../files/files.types'
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
export const isActionDisabledBasedOnRole = (userId?: number, space?: ISpace) => {
  if (!space) {
    return false
  }
  return !(space.host_lead?.id === userId || space.guest_lead?.id === userId)
}

/**
 * Disable action if space is protected and current user is not lead.
 */
export const isActionDisabledBasedOnProtected = (userId?: number, space?: ISpace) => {
  if (!space?.protected) {
    return false
  }
  return isActionDisabledBasedOnRole(userId, space)
}

export const isActionDisabledBasedOnLocked = (files: IFile[], userId?: number, space?: ISpace) => {
  if (files.every((file) => !file.locked)) {
    return false
  }
  return isActionDisabledBasedOnRole(userId, space)
}
