import axios from 'axios'
import { SideRole } from '../spaces.types'
import { ListMembersResponse, MEMBER_ROLE, MemberRole } from './members.types'

export type MembershipRolesChangePayload = {
  membershipIds: number[]
  targetRole?: number
  enabled?: boolean
}

export async function spacesMembersListRequest({
  spaceId,
  sideRole,
}: {
  spaceId: number | string
  sideRole?: SideRole
}): Promise<ListMembersResponse> {
  const params = sideRole ? { side: sideRole } : {}

  return axios.get(`/api/spaces/${spaceId}/members`, { params }).then(r => r.data)
}

export async function addMembersToSpaceRequest({
  spaceId,
  invitees,
  invitees_role,
}: {
  spaceId: number | string
  invitees: string
  invitees_role: MemberRole
}) {
  const res = await axios.post(`/api/spaces/${spaceId}/memberships/invite`, {
    invitees,
    invitees_role,
    side: null,
  })
  return res.data as Promise<unknown>
}

export async function changeMembershipRolesRequest(spaceId: number, payload: MembershipRolesChangePayload): Promise<void> {
  await axios.patch(`/api/v2/spaces/${spaceId}/memberships`, payload)
}
