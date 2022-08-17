import { IUser } from '../../../types/user'
import { MapKeysByObj } from '../../../utils/generics'
import { snakeToCamelMapping } from '../../../utils/snakeCaseMapping'

// NOTE(samuel) duplicate from backend - ideally generate these types
export const RESOURCE_TYPES = [
  // Compute instancess
  'baseline-2',
  'baseline-4',
  'baseline-8',
  'baseline-16',
  'baseline-36',
  'hidisk-2',
  'hidisk-4',
  'hidisk-8',
  'hidisk-16',
  'hidisk-36',
  'himem-2',
  'himem-4',
  'himem-8',
  'himem-16',
  'himem-32',
  'gpu-8',
  // Db instances
  'db_std1_x2',
  'db_mem1_x2',
  'db_mem1_x4',
  'db_mem1_x8',
  'db_mem1_x16',
  'db_mem1_x32',
  'db_mem1_x48',
  'db_mem1_x64',
] as const

export type User = MapKeysByObj<IUser, typeof snakeToCamelMapping> & {
  lastLogin: string
  userState: 'active' | 'deactivated' | 'locked' | 'n/a'
  cloudResourceSettings: {
    resources: (typeof RESOURCE_TYPES)[number][]
    job_limit: number
    total_limit: number
  }
}
