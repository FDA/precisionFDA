import PropTypes from 'prop-types'

import { mapToUser, UserShape } from './UserShape'
// eslint-disable-next-line
import { SPACE_STATUS_LOCKED, SPACE_STATUS_UNACTIVATED } from '../../constants'

const CountersShape = {
  members: PropTypes.number,
  apps: PropTypes.number,
  jobs: PropTypes.number,
  workflows: PropTypes.number,
  files: PropTypes.number,
}

const SpaceShape = {
  id: PropTypes.number,
  scope: PropTypes.string,
  name: PropTypes.string,
  desc: PropTypes.string,
  type: PropTypes.string,
  contextMembership: PropTypes.bool,
  canDuplicate: PropTypes.bool,
  updatable: PropTypes.bool,
  cts: PropTypes.string,
  isExclusive: PropTypes.bool,
  isPrivate: PropTypes.bool,
  isLocked: PropTypes.bool,
  isActive: PropTypes.bool,
  sharedSpaceId: PropTypes.number,
  privateSpaceId: PropTypes.number,
  hasLockLink: PropTypes.bool,
  hostLead: PropTypes.exact(UserShape),
  guestLead: PropTypes.exact(UserShape),
  status: PropTypes.string,
  links: PropTypes.object,
  counters: PropTypes.exact(CountersShape),
  tags: PropTypes.arrayOf(PropTypes.string),
  createdAt: PropTypes.string,
  updatedAt: PropTypes.string,
}

const mapToSpace = data => ({
  id: data.id,
  scope: `space-${data.id}`,
  name: data.name,
  desc: data.description,
  type: data.type,
  status: data.state,
  canDuplicate: data.can_duplicate,
  contextMembership: data.current_user_membership,
  updatable: data.updatable,
  cts: data.cts,
  isExclusive: data.private_exclusive,
  isPrivate: !!data.shared_space_id,
  isLocked: data.state === SPACE_STATUS_LOCKED,
  isActive: data.state !== SPACE_STATUS_UNACTIVATED,
  sharedSpaceId: data.shared_space_id,
  privateSpaceId: data.private_space_id,
  hasLockLink: !!(data.links.lock || data.links.unlock),
  hostLead: mapToUser(data.host_lead),
  guestLead: mapToUser(data.guest_lead),
  links: data.links,
  counters: {
    members: data.counters.members || 0,
    apps: data.counters.apps || 0,
    jobs: data.counters.jobs || 0,
    workflows: data.counters.workflows || 0,
    files: data.counters.files || 0,
  },
  tags: data.tags || [],
  createdAt: data.created_at,
  updatedAt: data.updated_at,
})

export default SpaceShape

export { SpaceShape, mapToSpace }
