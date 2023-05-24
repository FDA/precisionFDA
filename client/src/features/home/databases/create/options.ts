export type DatabaseEngineType =
  | 'aurora-mysql'
  | 'aurora-postgresql'

// NOTE(samuel): you can find configuration of dbcluster instance versions in nucleus repo
// nucleus/commons/@dnanexus/dx-dbcluster-instance-types/aws_rds_instance_types.json

export const HOME_DATABASE_MYSQL_INSTANCE_VERSIONS = {
  V_5_7_12: '5.7.mysql_aurora.2.07.8',
}

export const HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS = {
  V_11_16: '11.16',
  V_12_9: '12.9',
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
  'db_mem1_x96',
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
  DB_MEM1_X96: 'db_mem1_x96',
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
  'db_mem1_x96': 'DB Mem 1 x 96',
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

const checkDisabledInstances = (engine: string) => !engine

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
  {
    value: HOME_DATABASE_INSTANCES.DB_MEM1_X96,
    label: HOME_DATABASE_LABELS['db_mem1_x96'],
    isDisabled: checkDisabledInstances(engine),
  },
] : []

const checkDisabledVersions = (engine: string, dxInstanceClass: string) => !(dxInstanceClass && engine)

export const versionsOptions = (engine: DatabaseEngineType | null, dxInstanceClass?: string) => {
  if (!dxInstanceClass) {
    return []
  }
  switch (engine) {
    case 'aurora-postgresql':
      return [
        {
          value: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_11_16,
          label: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_11_16,
          isDisabled: checkDisabledVersions(engine, dxInstanceClass),
        },
        {
          value: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_12_9,
          label: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_12_9,
          isDisabled: checkDisabledVersions(engine, dxInstanceClass),
        },
      ]
    case 'aurora-mysql':
      return [
        {
          value: HOME_DATABASE_MYSQL_INSTANCE_VERSIONS.V_5_7_12,
          label: HOME_DATABASE_MYSQL_INSTANCE_VERSIONS.V_5_7_12,
          isDisabled: checkDisabledVersions(engine, dxInstanceClass),
        },
      ]
    default:
      return []
  }
}
