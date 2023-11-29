import { ConfigOverride } from '..'

export const config: ConfigOverride = () => ({
  logs: {
    level: process.env.LOG_LEVEL ?? 'error',
  },
  database: {
    // different env var names are used here
    dbName: process.env.DATABASE_TEST_NAME ?? 'precisionfda-test',
    clientUrl:
      process.env.DATABASE_TEST_URL ?? 'mysql://root:password@localhost:3306/precisionfda-test',
    // Enable debug mode to inspect SQL queries
    // debug: true,
  },
  api: {
    fdaSubnet: {
      allowedIpCidrBlock: {
        ipv4Quadruple: [127, 0, 0, 1],
        maskSize: 1,
      },
    },
  },
  emails: {
    smtp: {
      saveEmailToFile: true,
    },
  },
  redis: {
    url: 'redis://localhost:6379',
  },
  platform: {
    challengeBotUser: 'challenge-bot-test',
    challengeBotAccessToken: 'challenge-bot-test-access-token',
  },
  workerJobs: {
    queues: {
      default: {
        name: 'https-apps-worker-queue-tests',
      },
      maintenance: {
        onInit: {
          checkNonterminatedClusters: false,
        },
      },
    },
    syncJob: {
      // 2 days
      staleJobsEmailAfter: 60 * 60 * 24 * 2,
      // 3 days
      staleJobsTerminateAfter: 60 * 60 * 24 * 3,
    },
  },
  devFlags: {
    fda: {
      skipFdaSubnetIpCheck: false,
    },
  },
})
