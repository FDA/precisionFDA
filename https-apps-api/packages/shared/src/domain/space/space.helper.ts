import { defaultLogger as log } from '../../logger'
import { InternalError } from '../../errors'
import { Space, SpaceMembership } from '..'
import { SPACE_MEMBERSHIP_ROLE } from '../space-membership/space-membership.enum'
import { SPACE_TYPE } from './space.enum'

const getIdFromScopeName = (name: string): number => {
  const [prefix, id] = name.split('-')
  if (prefix !== 'space') {
    throw new InternalError('Scope space name has to start with "space" prefix')
  }
  const idValue = parseInt(id)
  if (isNaN(idValue) || idValue <= 0) {
    throw new InternalError('Invalid id number value')
  }
  return idValue
}

const getScopeFromSpaceId = (spaceId: number): string => `space-${spaceId}`

const isValidScopeName = (name: string): boolean => {
  try {
    getIdFromScopeName(name)
    return true
  } catch (err) {
    log.debug({ scopeName: name }, 'Invalid scope name provided, error swallowed')
    return false
  }
}

const getOrgDxid = (space: Space, spaceMembership: SpaceMembership): string =>
  spaceMembership.isHost() ? space.hostDxOrg : space.guestDxOrg

const getOppositeOrgDxid = (space: Space, spaceMembership: SpaceMembership): string =>
  spaceMembership.isHost() ? space.guestDxOrg : space.hostDxOrg

const setOrgDxid = (space: Space, spaceMembership: SpaceMembership, value: string) => {
  spaceMembership.isHost() ? space.hostDxOrg = value : space.guestDxOrg = value
}

const getProjectDxid = (space: Space, spaceMembership: SpaceMembership): string =>
  spaceMembership.isHost() ? space.hostProject : space.guestProject

const setProjectDxid = (space: Space, spaceMembership: SpaceMembership, value: string) => {
  spaceMembership.isHost() ? space.hostProject = value : space.guestProject = value
}

const isAcceptedBy = (space: Space, confidentialSpaces: Space[], spaceMembership: SpaceMembership): boolean => {
  if (!spaceMembership) { return false }
  if (space.type === SPACE_TYPE.REVIEW && space.isConfidential()) { return true }

  if ([SPACE_TYPE.GROUPS, SPACE_TYPE.GOVERNMENT, SPACE_TYPE.ADMINISTRATOR].includes(space.type)) {
    return getProjectDxid(space, spaceMembership) !== null
  }

  // review space check
  // TODO: clean this to not scare anyone reading it
  return (spaceMembership.isHost()
    && confidentialSpaces
      ?.filter(s => s.isConfidentialReviewerSpace())
      ?.[0]
      ?.spaceMemberships
      ?.getItems()
      ?.filter(sm => sm.isHost() && sm.role === SPACE_MEMBERSHIP_ROLE.LEAD)
    ?.[0] != null)
    || (spaceMembership.isGuest()
      && confidentialSpaces
        ?.filter(s => s.isConfidentialSponsorSpace())
        ?.[0]
        ?.spaceMemberships
        ?.getItems()
        ?.filter(sm => sm.isGuest() && sm.role === SPACE_MEMBERSHIP_ROLE.LEAD)
      ?.[0] != null)
}

export {
  isValidScopeName,
  getIdFromScopeName,
  getScopeFromSpaceId,
  getOrgDxid,
  getOppositeOrgDxid,
  setOrgDxid,
  getProjectDxid,
  setProjectDxid,
  isAcceptedBy
}
