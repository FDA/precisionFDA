import { ConfigOverride } from '..'

export const config: ConfigOverride = {
  logs: {
    level: process.env.LOG_LEVEL || 'error',
  },
  database: {
    dbName: 'precisionfda-test',
    clientUrl: process.env.DATABASE_TEST_URL ?? 'mysql://root:password@localhost:3306',
    debug: false,
  },
}
