
export interface Counters {
  files: number;
  apps: number;
  workflows: number;
  jobs: number;
  members: number;
}

export interface Links {
  show: string;
  update: string;
  update_tags: string;
  apps: string;
  files: string;
  workflows: string;
  jobs: string;
  members: string;
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

export interface ISpace {
  id: string;
  description: string;
  state: string;
  name: string;
  type: string;
  cts?: any;
  created_at: string;
  updated_at: string;
  counters: Counters;
  links: Links;
  updatable: boolean;
  tags: any[];
  current_user_membership: boolean;
  host_lead: HostLead;
  guest_lead: GuestLead;
  private_space_id?: string
  shared_space_id?: string
}
