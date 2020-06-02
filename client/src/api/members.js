import { backendCall } from '../utils/api'


const inviteNewMembers = (spaceId, data) =>
  backendCall(`/api/spaces/${spaceId}/memberships/invite`, 'POST', data)
const canChangeRole = (spaceId, data) =>
  backendCall(`/api/spaces/${spaceId}/memberships/can_change_role`, 'GET', data)
const memberRoleUpdate = (spaceId, memberId, data) =>
  backendCall(`/api/spaces/${spaceId}/memberships/${memberId}`, 'PATCH', data)


export {
  inviteNewMembers,
  canChangeRole,
  memberRoleUpdate,
}
