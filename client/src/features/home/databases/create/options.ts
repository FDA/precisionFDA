export const HOME_DATABASE_ENGINE_TYPES = {
  'MySQL': 'aurora-mysql',
  'PostgreSQL': 'aurora-postgresql',
}

export const HOME_DATABASE_MYSQL_INSTANCE_VERSIONS = {
  V_5_7_12: '5.7.12',
}

export const HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS = {
  V_9_6_16: '9.6.16',
  V_9_6_17: '9.6.17',
  V_9_6_18: '9.6.18',
  V_9_6_19: '9.6.19',
  V_10_14: '10.14',
}

export const HOME_DATABASE_INSTANCE_CLASSES = [
  'db_std1_x2',
  'db_mem1_x2',
  'db_mem1_x4',
  'db_mem1_x8',
  'db_mem1_x16',
  'db_mem1_x32',
  'db_mem1_x48',
  'db_mem1_x64',
]

export const HOME_DATABASE_INSTANCES = {
  DB_STD1_X2: 'db_std1_x2',
  DB_MEM1_X2: 'db_mem1_x2',
  DB_MEM1_X4: 'db_mem1_x4',
  DB_MEM1_X8: 'db_mem1_x8',
  DB_MEM1_X16: 'db_mem1_x16',
  DB_MEM1_X32: 'db_mem1_x32',
  DB_MEM1_X48: 'db_mem1_x48',
  DB_MEM1_X64: 'db_mem1_x64',
}

export const HOME_DATABASE_LABELS = {
  'db_std1_x2': 'DB Baseline 1 x 2',
  'db_mem1_x2': 'DB Mem 1 x 2',
  'db_mem1_x4': 'DB Mem 1 x 4',
  'db_mem1_x8': 'DB Mem 1 x 8',
  'db_mem1_x16': 'DB Mem 1 x 16',
  'db_mem1_x32': 'DB Mem 1 x 32',
  'db_mem1_x48': 'DB Mem 1 x 48',
  'db_mem1_x64': 'DB Mem 1 x 64',
  'aurora-mysql': 'MySQL',
  'aurora-postgresql': 'PostgreSQL',
  'available': 'Available',
  'creating': 'Creating',
  'starting': 'Starting',
  'stopped': 'Stopped',
  'stopping': 'Stopping',
  'terminated': 'Terminated',
  'terminating': 'Terminating',
}

const checkDisabledInstances = (engine: string) => { return !engine }

export const instancesOptions = (engine?: string) => engine ? [
  {
    value: HOME_DATABASE_INSTANCES.DB_STD1_X2,
    label: HOME_DATABASE_LABELS['db_std1_x2'],
    isDisabled: checkDisabledInstances(engine),
  },
  {
    value: HOME_DATABASE_INSTANCES.DB_MEM1_X2,
    label: HOME_DATABASE_LABELS['db_mem1_x2'],
    isDisabled: checkDisabledInstances(engine),
  },
  {
    value: HOME_DATABASE_INSTANCES.DB_MEM1_X4,
    label: HOME_DATABASE_LABELS['db_mem1_x4'],
    isDisabled: checkDisabledInstances(engine),
  },
  {
    value: HOME_DATABASE_INSTANCES.DB_MEM1_X8,
    label: HOME_DATABASE_LABELS['db_mem1_x8'],
    isDisabled: checkDisabledInstances(engine),
  },
  {
    value: HOME_DATABASE_INSTANCES.DB_MEM1_X16,
    label: HOME_DATABASE_LABELS['db_mem1_x16'],
    isDisabled: checkDisabledInstances(engine),
  },
  {
    value: HOME_DATABASE_INSTANCES.DB_MEM1_X32,
    label: HOME_DATABASE_LABELS['db_mem1_x32'],
    isDisabled: checkDisabledInstances(engine),
  },
  {
    value: HOME_DATABASE_INSTANCES.DB_MEM1_X48,
    label: HOME_DATABASE_LABELS['db_mem1_x48'],
    isDisabled: checkDisabledInstances(engine),
  },
  {
    value: HOME_DATABASE_INSTANCES.DB_MEM1_X64,
    label: HOME_DATABASE_LABELS['db_mem1_x64'],
    isDisabled: checkDisabledInstances(engine),
  },
] : []

const hideMysqlVersions = (engine: string) => { return engine === HOME_DATABASE_ENGINE_TYPES['PostgreSQL'] }
const hidePgVersions = (engine: string) => { return engine === HOME_DATABASE_ENGINE_TYPES['MySQL'] }

const restrictedPgInstances = [
  HOME_DATABASE_INSTANCES.DB_STD1_X2,
  HOME_DATABASE_INSTANCES.DB_MEM1_X2,
  HOME_DATABASE_INSTANCES.DB_MEM1_X4,
  HOME_DATABASE_INSTANCES.DB_MEM1_X8,
  HOME_DATABASE_INSTANCES.DB_MEM1_X16,
  HOME_DATABASE_INSTANCES.DB_MEM1_X48,
]

const hidePgVersionsForSomeInstances = (dxInstanceClass: string) => { return restrictedPgInstances.includes(dxInstanceClass) }
const checkDisabledVersions = (engine: string, dxInstanceClass: string) => { return !(dxInstanceClass && engine) }

export const versionsOptions = (engine?: string, dxInstanceClass?: string) => engine && dxInstanceClass ? [
  {
    value: HOME_DATABASE_MYSQL_INSTANCE_VERSIONS.V_5_7_12,
    label: HOME_DATABASE_MYSQL_INSTANCE_VERSIONS.V_5_7_12,
    isDisabled: checkDisabledVersions(engine, dxInstanceClass) || hideMysqlVersions(engine),
  },
  {
    value: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_9_6_16,
    label: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_9_6_16,
    isDisabled: checkDisabledVersions(engine, dxInstanceClass) || hidePgVersions(engine) || hidePgVersionsForSomeInstances(dxInstanceClass),
  },
  {
    value: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_9_6_17,
    label: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_9_6_17,
    isDisabled: checkDisabledVersions(engine, dxInstanceClass) || hidePgVersions(engine) || hidePgVersionsForSomeInstances(dxInstanceClass),
  },
  {
    value: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_9_6_18,
    label: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_9_6_18,
    hide: hidePgVersions(engine) || hidePgVersionsForSomeInstances(dxInstanceClass),
    isDisabled: checkDisabledVersions(engine, dxInstanceClass) || hidePgVersions(engine) || hidePgVersionsForSomeInstances(dxInstanceClass),
  },
  {
    value: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_9_6_19,
    label: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_9_6_19,
    isDisabled: checkDisabledVersions(engine, dxInstanceClass) || hidePgVersions(engine) || hidePgVersionsForSomeInstances(dxInstanceClass),
  },
  {
    value: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_10_14,
    label: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_10_14,
    isDisabled: checkDisabledVersions(engine, dxInstanceClass) || hidePgVersions(engine),
  },
]: []
