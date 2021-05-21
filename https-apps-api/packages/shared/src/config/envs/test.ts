import { ConfigOverride } from '..'

export const config: ConfigOverride = {
  logs: {
    level: process.env.LOG_LEVEL || 'error',
  },
  database: {
    // different env var names are used here
    dbName: process.env.DATABASE_TEST_NAME ?? 'precisionfda-test',
    clientUrl:
      process.env.DATABASE_TEST_URL ?? 'mysql://root:password@localhost:3306/precisionfda-test',
    // debug: true,
    debug: false,
  },
  redis: {
    url: 'redis://localhost:6379',
  },
  users: {
    challengeBotDxUser: 'challenge-bot-test',
  },
  workerJobs: {
    queues: {
      default: {
        name: 'https-apps-worker-queue-tests',
      },
    },
  },
}
