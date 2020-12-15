import { ConfigOverride } from '..'

export const config: ConfigOverride = {
  logs: {
    level: process.env.LOG_LEVEL || 'error',
  },
  database: {
    dbName: process.env.DATABASE_TEST_NAME ?? 'precisionfda-test',
    clientUrl: process.env.DATABASE_TEST_URL ?? 'mysql://root:password@localhost:3306',
    // debug: true,
    debug: false,
  },
  workerJobs: {
    queues: {
      default: {
        name: 'https-apps-worker-queue-tests',
      },
    },
  },
}
