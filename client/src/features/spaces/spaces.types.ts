import { MemberRole, MemberSide } from './members/members.types'

export interface Counters {
  files: number;
  apps: number;
  workflows: number;
  jobs: number;
  members: number;
}

export interface Links {
  add_data?: string;
  show?: string;
  lock?: string;
  unlock?: string;
  update?: string;
  delete?: string;
  update_tags?: string;
  apps?: string;
  files?: string;
  workflows?: string;
  jobs?: string;
  members?: string;
  show_private?: string;
}

export interface HostLead {
  id: number;
  dxuser: string;
  user_url: string;
  name: string;
  org: string;
  is_accepted: boolean;
}

export interface GuestLead {
  id: number;
  dxuser: string;
  user_url: string;
  name: string;
  org: string;
  is_accepted: boolean;
}

export interface SpaceMembership {
  active: boolean;
  created_at: string;
  id: number;
  meta: Record<string, string>;
  role: MemberRole;
  side: MemberSide;
  updated_at: string;
  user_id: number;
}

export interface ConfidentialSpace {
  id: number;
  description: string;
  state: string;
  name: string;
  type: string;
  cts: string;
  created_at: string;
  updated_at: string;
  counters: Counters;
  links: Links;
  updatable: boolean;
  shared_space_id: number;
  tags: any[];
  current_user_membership: SpaceMembership;
  host_lead: HostLead;
}

export type SideRole = 'reviewer' | 'sponsor'

// PK's note: this interface represents Space, but rails transform DB entity to a different structure and node returns the data as it is stored in the DB
export interface ISpace {
  id: string;
  description: string;
  state: 'active' | 'unactivated';
  name: string;
  type: 'groups' | 'review' | 'private_type' | 'government' | 'administrator' | number // number is the value from DB, string is value from db translated to human readable
  cts?: any;
  protected: boolean;
  created_at: string;
  updated_at: string;
  space_create: string;
  counters: Counters;
  links: Links;
  updatable: boolean;
  tags: any[];
  spaceId: number;
  current_user_membership: SpaceMembership;
  host_lead: HostLead;
  guest_lead: GuestLead;
  private_space_id?: string;
  shared_space_id?: string;
  can_duplicate: boolean;
  confidential_space: ConfidentialSpace;
}

export const columnFilters = {
  name: 'string',
  description: 'string',
  state: 'string',
  tags: 'string',
  status: 'string',
  featured: 'string',
  created_at: 'string',
  updated_at: 'string',
  host_lead: 'string',
  guest_lead: 'string',
  type: 'string',
}

export const SPACE_TYPES = {
  GROUPS: 0,
  REVIEW: 1,
  VERIFICATION: 2,
  PRIVATE_TYPE: 3,
  GOVERNMENT: 4,
  ADMINISTRATOR: 5,
}
