import { ISpace } from '../spaces.types'

export interface Links {
  user: string
}

export type MemberRole = 'lead' | 'contributor' | 'viewer' | 'admin' | 'disable' | 'enable'
export type MemberSide = 'host' | 'guest'

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
  active: boolean
  role: MemberRole
  side: MemberSide
  org: string
  domain: string
  created_at: string
  links: Links
  to_roles: MemberRole[]
}

export interface ListMembersResponse {
  space_memberships: SpaceMembership[]
}
