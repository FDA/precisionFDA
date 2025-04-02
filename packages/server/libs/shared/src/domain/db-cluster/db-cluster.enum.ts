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
  'db_mem1_x96',
]

const allowedEngineVersions = ['8.0.mysql_aurora.3.04.1', '11.9', '12.9', '13.9', '14.6']

const allowedEngines = ['aurora-mysql', 'aurora-postgresql']

type EncryptedData = {
  ciphertext: string
  salt: string
  iv: string
  tag: string
}

type UserMapping = {
  username: string
  psw: string
  role: string
}

type DataToEncrypt = {
  db_cluster_id: string
  db_cluster_admin_username: string
  db_cluster_admin_password: string
  users_mapping: UserMapping[]
}

export {
  ENGINE,
  STATUS,
  ENGINES,
  STATUSES,
  allowedEngineVersions,
  allowedEngines,
  allowedInstanceTypes,
  EncryptedData,
  UserMapping,
  DataToEncrypt,
}
