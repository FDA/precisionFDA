import { DATABASE_RESOURCE_LABELS } from '@/types/user'
import { ServerScope } from '../home/types'

export interface Links {
  user?: string
  attach_to?: string
  publish?: string
  copy?: string
  run_workflow?: string
  batch_run_workflow?: string
  edit?: string
  fork?: string
  cwl_export?: string
  wdl_export?: string
  set_tags?: string
  set_tags_target?: string
  delete?: string
  create?: string
  update?: string
  track?: string
  start?: string
  stop?: string
  terminate?: string
  license?: string
  detach_license?: string
}

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
  /** @deprecated create links from client side */
  links: Links
  scope: ServerScope
  featured: boolean
  failureReason: string
  currentUserRole?: string
}

export type MethodType = 'start' | 'stop' | 'terminate'
