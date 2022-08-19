import axios from 'axios'
import { SideRole } from '../spaces.types'
import { ListMembersResponse, MemberRole } from './members.types'

export async function spacesMembersListRequest({ spaceId, sideRole }: { spaceId: string, sideRole?: SideRole }): Promise<ListMembersResponse> {
  const paramQ = `?${  new URLSearchParams({ side: sideRole } as Record<string, SideRole>).toString()}`

  const res = await fetch(`/api/spaces/${spaceId}/members${paramQ}`)
  return res.json()
}

export async function addMembersToSpaceRequest({ spaceId, invitees, invitees_role }: { spaceId: string, invitees: string, invitees_role: MemberRole }) {
  const res = await axios.post(`/api/spaces/${spaceId}/memberships/invite`, {
    invitees,
    invitees_role,
    side: null,
  })
  return res.data as Promise<any>
}

export async function changeMembershipRoleRequest({ spaceId, memberId, role }: { spaceId: string, memberId: string, role: MemberRole }) {
  const res = await axios.patch(`/api/spaces/${spaceId}/memberships/${memberId}`, {
    role,
  })
  return res.data as Promise<any>
}
