import { ISpace } from '../spaces.types'

export interface Links {
  user: string
}

export type MemberRole = 'lead' | 'contributor' | 'viewer' | 'admin' | 'disable' | 'enable'
export type MemberSide = 'host' | 'guest'

export type MemberRoleV2 = 'LEAD' | 'CONTRIBUTOR' | 'VIEWER' | 'ADMIN'
export type MemberSideV2 = 'HOST' | 'GUEST'

export enum MEMBER_ROLE {
  ADMIN = 0,
  CONTRIBUTOR = 1,
  VIEWER = 2,
  LEAD = 3,
}

export const getSpaceMembershipSideAlias = (side: MemberSide, space: ISpace) => {
  switch (space.type) {
    case 'review':
      return side === 'host' ? 'Reviewer' : 'Sponsor'
    default:
      return side === 'host' ? 'Host' : 'Guest'
  }
}

export interface SpaceMembership {
  id: number
  user_name: string
  title: string
  active: 'Active' | 'Inactive' | 'Account deactivated'
  role: MemberRole
  side: MemberSide
  org: string
  domain: string
  created_at: string
  links: Links
  to_roles: MemberRole[]
  shared_membership_id: number
}

export interface SpaceMembershipV2 {
  active: boolean
  createdAt: string
  id: number
  name: string
  role: MemberRoleV2
  side: MemberSideV2
  userActive: boolean
  username: string
}

export interface ListMembersResponse {
  space_memberships: SpaceMembership[]
}

export interface ChangeMemberRolesResponse {
  membershipIds: number[]
  role: MemberRole
  active: boolean
}

export interface UpdateRolesFormValues {
  role: { label: string; value: MemberRole }
}
