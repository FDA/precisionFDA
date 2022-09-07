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
  emails: {
    salesforce: {
      isEnabled: false,
    }
  },
  redis: {
    url: 'redis://localhost:6379',
  },
  users: {
    challengeBotDxUser: 'challenge-bot-test',
  },
  workerJobs: {
    syncJob: {
      // 2 days
      staleJobsEmailAfter: 60 * 60 * 24 * 2,
      // 3 days
      staleJobsTerminateAfter: 60 * 60 * 24 * 3,
    },
    queues: {
      default: {
        name: 'https-apps-worker-queue-tests',
      },
    },
  },
  shouldAddCheckNonterminatedClustersOnInit: false
}
