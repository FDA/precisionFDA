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

const allowedInstanceTypes = [
  'db_std1_x2',
  'db_mem1_x2',
  'db_mem1_x4',
  'db_mem1_x8',
  'db_mem1_x16',
  'db_mem1_x32',
  'db_mem1_x48',
  'db_mem1_x64',
]

const allowedEngineVersions = [
  '5.7.12',
  '9.6.16',
  '9.6.17',
  '9.6.18',
  '9.6.19',
  '10.14',
]

export {
  ENGINE,
  STATUS,
  ENGINES,
  STATUSES,
  allowedEngineVersions,
  allowedInstanceTypes,
}
