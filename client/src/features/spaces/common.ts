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
  } if (type === 'groups') {
    return 'Host Lead'
  }
  return ''
}

export const getGuestLeadLabel = (type: ISpace['type']) => {
  if (type === 'review') {
    return 'Reviewer Lead'
  } if (type === 'groups') {
    return 'Guest Lead'
  }
  return ''
}
