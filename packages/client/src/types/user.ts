export const RESOURCE_LABELS = {
  // Compute instance labels
  'baseline-2': 'Baseline 2',
  'baseline-4': 'Baseline 4',
  'baseline-8': 'Baseline 8',
  'baseline-16': 'Baseline 16',
  'baseline-36': 'Baseline 36',
  'himem-2': 'High Mem 2',
  'himem-4': 'High Mem 4',
  'himem-8': 'High Mem 8',
  'himem-16': 'High Mem 16',
  'himem-32': 'High Mem 32',
  'hidisk-2': 'High Disk 2',
  'hidisk-4': 'High Disk 4',
  'hidisk-8': 'High Disk 8',
  'hidisk-16': 'High Disk 16',
  'hidisk-36': 'High Disk 36',
  'gpu-8': 'GPU 8',

  // Database instance labels

  // NOTE(samuel) unused
  // "db_std1_x1": "DB Baseline 1 x 1",
  'db_std1_x2': 'DB Baseline 1 x 2',
  'db_mem1_x2': 'DB Mem 1 x 2',
  'db_mem1_x4': 'DB Mem 1 x 4',
  'db_mem1_x8': 'DB Mem 1 x 8',
  'db_mem1_x16': 'DB Mem 1 x 16',
  'db_mem1_x32': 'DB Mem 1 x 32',
  'db_mem1_x48': 'DB Mem 1 x 48',
  'db_mem1_x64': 'DB Mem 1 x 64',
  // NOTE(samuel) unused
  // "db_mem1_x96": "DB Mem 1 x 96",
} as const

export const RESOURCES = Object.keys(RESOURCE_LABELS) as (keyof typeof RESOURCE_LABELS)[]
export interface IUser {
  id: number,
  name: string,

  fullName: string,
  org: string,
  url: string,
  isAccepted: boolean,
  isGovUser?: boolean,
  isAdmin?: boolean,
  dxuser: string,
  admin: boolean
  can_access_notification_preference: boolean
  can_administer_site: boolean
  review_space_admin: boolean
  can_create_challenges: boolean
  allowed_to_publish: boolean

  can_create_data_portals: boolean
  can_see_spaces: boolean
  counters: {
    files: number,
    folders: number,
    apps: number,
    workflows: number,
    jobs: number,
    assets: number,
    notes: number
  }
  resources: typeof RESOURCES
  email: string
  first_name: string
  full_name: string
  gravatar_url: string
  is_guest: boolean
  job_limit: number
  last_name: string
  links: any
  handle: string
  session_id: string
}
