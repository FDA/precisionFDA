
export interface Links {
  user: string;
}

export type MemberRole = 'lead' | 'contributor' | 'viewer' | 'admin' | 'disable' | 'enable'
export type MemberSide = 'host' | 'guest'

export interface SpaceMembership {
  id: number;
  user_name: string;
  title: string;
  active: boolean;
  role: MemberRole;
  side: MemberSide;
  org: string;
  domain: string;
  created_at: string;
  links: Links;
  to_roles: any[];
}

export interface ListMembersResponse {
  space_memberships: SpaceMembership[];
}

