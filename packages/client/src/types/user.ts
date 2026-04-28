export const COMPUTE_RESOURCE_LABELS = {
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
} as const

export const DATABASE_RESOURCE_LABELS = {
  // Database instance labels
  db_std1_x2: 'DB Baseline 1 x 2',
  db_mem1_x2: 'DB Mem 1 x 2',
  db_mem1_x4: 'DB Mem 1 x 4',
  db_mem1_x8: 'DB Mem 1 x 8',
  db_mem1_x16: 'DB Mem 1 x 16',
  db_mem1_x32: 'DB Mem 1 x 32',
  db_mem1_x48: 'DB Mem 1 x 48',
  db_mem1_x64: 'DB Mem 1 x 64',
} as const

export const RESOURCE_LABELS = { ...COMPUTE_RESOURCE_LABELS, ...DATABASE_RESOURCE_LABELS }

export type ComputeResourceKey = keyof typeof COMPUTE_RESOURCE_LABELS
export type DatabaseResourceKey = keyof typeof DATABASE_RESOURCE_LABELS
export type ResourceKey = keyof typeof RESOURCE_LABELS

export const isComputeResource = (r: ResourceKey): r is ComputeResourceKey => !r.startsWith('db_')
export const isDatabaseResource = (r: ResourceKey): r is DatabaseResourceKey => r.startsWith('db_')

export const ComputeResourcePricingMap: Record<ComputeResourceKey, number> = {
  'baseline-2': 0.286,
  'baseline-4': 0.572,
  'baseline-8': 1.144,
  'baseline-16': 2.288,
  'baseline-36': 5.148,
  'hidisk-2': 0.372,
  'hidisk-4': 0.744,
  'hidisk-8': 1.488,
  'hidisk-16': 2.976,
  'hidisk-36': 6.696,
  'himem-2': 0.474,
  'himem-4': 0.948,
  'himem-8': 1.896,
  'himem-16': 3.792,
  'himem-32': 7.584,
  'gpu-8': 10.787,
}

export const DatabaseInstancePricingMap: Record<DatabaseResourceKey, number> = {
  db_std1_x2: 0.273,
  db_mem1_x2: 0.967,
  db_mem1_x4: 1.933,
  db_mem1_x8: 3.867,
  db_mem1_x16: 7.733,
  db_mem1_x32: 15.467,
  db_mem1_x48: 23.2,
  db_mem1_x64: 30.933,
}

export const RESOURCES = Object.keys(RESOURCE_LABELS) as ResourceKey[]

export interface IUser {
  id: number
  org: { id: number; name: string; handle: string }
  isGovUser?: boolean // derived from email domain, not returned by API
  isAdmin?: boolean // derived from can_administer_site, not returned by API
  dxuser: string
  admin: boolean
  can_access_notification_preference: boolean
  can_administer_site: boolean
  review_space_admin: boolean
  can_create_challenges: boolean
  allowed_to_publish: boolean
  can_see_spaces: boolean
  header_items: { name: string; favorite: boolean }[]
  resources: ResourceKey[]
  pricing_map: Partial<Record<ResourceKey, number>>
  email: string
  first_name: string
  full_name: string
  job_limit: number
  last_name: string
  handle: string
  session_id: string
  time_zone?: string
  total_limit: number
}

// Node Backend User Type
export type SimpleUser = {
  id: number
  dxuser: string
  firstName: string
  lastName: string
  fullName: string
}
