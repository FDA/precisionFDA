import { SpaceMembership } from '../spaces/spaces.types'
import { DataPortal } from './types'

export function isUserInMemberRole(user?: string, members?: DataPortal['members'], allowedRoles?: SpaceMembership['role'][]) {
  if(!user || !members || !allowedRoles) return false
  const cm = members.find((m) => m.dxuser === user)
  if(!cm) return false
  if(allowedRoles.includes(cm.role)) return true
  return false
}

const allowedEditSettingsRoles: SpaceMembership['role'][] = ['lead']
export function canEditSettings(user?: string, members?: DataPortal['members']) {
  return isUserInMemberRole(user, members, allowedEditSettingsRoles)
}

const allowedViewSpaceLinkRoles: SpaceMembership['role'][] = ['lead','admin']
export function canViewSpaceLink(user?: string, members?: DataPortal['members']) {
  return isUserInMemberRole(user, members, allowedViewSpaceLinkRoles)
}

const allowedEditContentRoles: SpaceMembership['role'][] = ['admin', 'lead', 'contributor']
export function canEditContent(user?: string, members?: DataPortal['members']) {
  return isUserInMemberRole(user, members, allowedEditContentRoles)
}

const allowedEditResources: SpaceMembership['role'][] = ['admin', 'contributor', 'lead']
export function canEditResources(user?: string, members?: DataPortal['members']) {
  return isUserInMemberRole(user, members, allowedEditResources)
}
