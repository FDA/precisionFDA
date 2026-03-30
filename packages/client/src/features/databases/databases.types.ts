import { DATABASE_RESOURCE_LABELS } from '@/types/user'
import { FileLicense } from '../assets/assets.types'
import { ServerScope } from '../home/types'

export type DBStatus = 'creating' | 'available' | 'stopped' | 'stopping' | 'starting' | 'terminating' | 'terminated'

export type DbSyncStatus = 'in progress' | 'failed' | 'completed'

export interface IDatabase {
  id: number
  dxid: string
  uid: string
  name: string
  title: string
  status: DBStatus
  syncStatus: DbSyncStatus
  location: string
  scopeName: string
  description: string
  addedBy: string
  addedByFullname: string
  createdAt: Date
  createdAtDateTime: string
  engine: string
  engineVersion: string
  dxInstanceClass: keyof typeof DATABASE_RESOURCE_LABELS
  statusAsOf: Date
  statusUpdatedDateTime: string
  host: string
  port: string
  showLicensePending: boolean
  tags: string[]
  properties: {
    [key: string]: string
  }
  scope: ServerScope
  featured: boolean
  failureReason: string
  currentUserRole?: string
  canStart?: boolean
  canStop?: boolean
  canTerminate?: boolean
  fileLicense?: FileLicense | null
}

export type MethodType = 'start' | 'stop' | 'terminate'
