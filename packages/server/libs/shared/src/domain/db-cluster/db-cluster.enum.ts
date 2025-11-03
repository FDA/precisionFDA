enum STATUS {
  AVAILABLE = 0,
  CREATING = 1,
  STOPPING = 2,
  STOPPED = 3,
  STARTING = 4,
  TERMINATING = 5,
  TERMINATED = 6,
}

enum ENGINE {
  MYSQL = 0,
  POSTGRESQL = 1,
}

enum DB_SYNC_STATUS {
  COMPLETED = 0,
  IN_PROGRESS = 1,
  FAILED = 2,
}

const STATUSES = {
  AVAILABLE: 'available',
  CREATING: 'creating',
  STOPPING: 'stopping',
  STOPPED: 'stopped',
  STARTING: 'starting',
  TERMINATING: 'terminating',
  TERMINATED: 'terminated',
} as const

const ENGINES = {
  MYSQL: 'aurora-mysql',
  POSTGRESQL: 'aurora-postgresql',
} as const

const DB_SYNC_STATUSES = {
  COMPLETED: 'completed',
  IN_PROGRESS: 'in progress',
  FAILED: 'failed',
} as const

const allowedInstanceTypes = [
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

const allowedEngineVersions = ['8.0.mysql_aurora.3.04.1', '11.9', '12.9', '13.9', '14.6']

const allowedEngines = ['aurora-mysql', 'aurora-postgresql']

interface ActionConfig {
  requiredStatus: STATUS
  errorMessage: string
}

type DbClusterStatus = (typeof STATUSES)[keyof typeof STATUSES]

type DbClusterSyncStatus = (typeof DB_SYNC_STATUSES)[keyof typeof DB_SYNC_STATUSES]

export {
  ENGINE,
  STATUS,
  DB_SYNC_STATUS,
  ENGINES,
  STATUSES,
  DB_SYNC_STATUSES,
  allowedEngineVersions,
  allowedEngines,
  allowedInstanceTypes,
  ActionConfig,
  DbClusterStatus,
  DbClusterSyncStatus,
}
