import axios from 'axios'
import { SideRole } from '../spaces.types'
import { ListMembersResponse, MemberRole } from './members.types'

export async function spacesMembersListRequest({ spaceId, sideRole }: { spaceId: number, sideRole?: SideRole }): Promise<ListMembersResponse> {
  const params = sideRole ? { side: sideRole } : {};

  const res = await axios.get(`/api/spaces/${spaceId}/members`, { params })
  return res.data
}

export async function addMembersToSpaceRequest({ spaceId, invitees, invitees_role }: { spaceId: string, invitees: string, invitees_role: MemberRole }) {
  const res = await axios.post(`/api/spaces/${spaceId}/memberships/invite`, {
    invitees,
    invitees_role,
    side: null,
  })
  return res.data as Promise<any>
}

export async function changeMembershipRoleRequest({ spaceId, memberId, role }: { spaceId: number, memberId: number, role: MemberRole }) {
  const res = await axios.patch(`/api/spaces/${spaceId}/memberships/${memberId}`, {
    role,
  })
  return res.data as Promise<any>
}
