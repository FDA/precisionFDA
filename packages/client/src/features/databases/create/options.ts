export type DatabaseEngineType = 'aurora-mysql' | 'aurora-postgresql'

const HOME_DATABASE_MYSQL_INSTANCE_VERSIONS = {
  V_8_0: '8.0.mysql_aurora.3.04.1',
}

const HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS = {
  V_14_6: '14.6',
  V_13_9: '13.9',
  V_12_9: '12.9',
  V_11_9: '11.9',
}

export const versionsOptions = (engine: DatabaseEngineType, dxInstanceClass?: string) => {
  if (!dxInstanceClass) {
    return []
  }
  switch (engine) {
    case 'aurora-postgresql':
      return [
        {
          value: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_14_6,
          label: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_14_6,
        },
        {
          value: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_13_9,
          label: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_13_9,
        },
        {
          value: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_12_9,
          label: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_12_9,
        },
        {
          value: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_11_9,
          label: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_11_9,
        },
      ]
    case 'aurora-mysql':
      return [
        {
          value: HOME_DATABASE_MYSQL_INSTANCE_VERSIONS.V_8_0,
          label: HOME_DATABASE_MYSQL_INSTANCE_VERSIONS.V_8_0,
        },
      ]
  }
}
