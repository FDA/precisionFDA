export interface Regions {
  'pre-registration'?: string;
  'intro'?: string;
  'results'?: string;
  'results-details'?: string;
}

export interface Meta {
  regions?: Regions;
}

export type ChallengeStatus = 'setup' | 'pre-registration' | 'open' | 'paused' | 'archived' | 'result_announced'

export interface Challenge {
  id: number;
  name: string;
  description: string;
  meta: Meta;
  start_at: Date;
  end_at: Date;
  created_at: Date;
  updated_at: Date;
  status: ChallengeStatus;
  scope: string;
  card_image_url: string;
  card_image_id: string;
  pre_registration_url: string;
  guest_lead_dxuser: string;
  host_lead_dxuser: string;
  app_owner_id: string;
  links?: any;
  is_followed?: any;
  can_edit?: any;
  is_space_member: boolean;
}

export type TimeStatus = 'upcoming' | 'ended' | 'current'

export interface ChallengeListParams {
  year?: string
  time_status?: TimeStatus
  page?: number
  perPage?: number
}
