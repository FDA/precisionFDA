export enum STATUS {
  AVAILABLE = 0,
  CREATING = 1,
  STOPPING = 2,
  STOPPED = 3,
  STARTING = 4,
  TERMINATING = 5,
  TERMINATED = 6,
}

export enum ENGINE {
  MYSQL = 0,
  POSTGRESQL = 1,
}

export enum DB_SYNC_STATUS {
  COMPLETED = 0,
  IN_PROGRESS = 1,
  FAILED = 2,
}

export const STATUSES = {
  AVAILABLE: 'available',
  CREATING: 'creating',
  STOPPING: 'stopping',
  STOPPED: 'stopped',
  STARTING: 'starting',
  TERMINATING: 'terminating',
  TERMINATED: 'terminated',
} as const

export const ENGINES = {
  MYSQL: 'aurora-mysql',
  POSTGRESQL: 'aurora-postgresql',
} as const

export const DB_SYNC_STATUSES = {
  COMPLETED: 'completed',
  IN_PROGRESS: 'in progress',
  FAILED: 'failed',
} as const

export const allowedInstanceTypes = [
  'db_std1_x2',
  'db_mem1_x2',
  'db_mem1_x4',
  'db_mem1_x8',
  'db_mem1_x16',
  'db_mem1_x32',
  'db_mem1_x48',
  'db_mem1_x64',
  'db_mem1_x96',
]

export const allowedEngineVersions = ['8.0.mysql_aurora.3.04.1', '11.9', '12.9', '13.9', '14.6']

export const allowedEngines = ['aurora-mysql', 'aurora-postgresql']

export interface ActionConfig {
  requiredStatus: STATUS
  errorMessage: string
}

export type DbClusterStatus = (typeof STATUSES)[keyof typeof STATUSES]

export type DbClusterSyncStatus = (typeof DB_SYNC_STATUSES)[keyof typeof DB_SYNC_STATUSES]
