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
  startAt: Date;
  endAt: Date;
  status: ChallengeStatus;
  scope: string;
  appUid: string;
  spaceId: string;
  cardImageUrl: string;
  preRegistrationUrl: string;
  // guest_lead_dxuser: string;
  // host_lead_dxuser: string;
  // app_owner_id: string;
  follows?: boolean;
  canEdit?: boolean;
  isSpaceMember: boolean;

  infoContent: string
  infoEditorState: string

  preRegistrationContent: string
  preRegistrationEditorState: string

  resultsContent: string
  resultsEditorState: string
}

export type TimeStatus = 'upcoming' | 'ended' | 'current'

export interface ChallengeListParams {
  year?: string
  timeStatus?: TimeStatus
  page?: number
  pageSize?: number
}


export interface Regions {
  'pre-registration'?: string;
  'intro'?: string;
  'results'?: string;
  'results-details'?: string;
}

export interface Meta {
  regions?: Regions;
}

// @deprecated Use Challenge interface instead
export interface ChallengeOld {
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
  /** @deprecated create links from client side */
  links?: Record<string, string>[];
  is_followed?: boolean;
  can_edit?: boolean;
  is_space_member: boolean;
}
