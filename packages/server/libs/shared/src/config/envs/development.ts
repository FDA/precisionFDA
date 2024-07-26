import { ConfigOverride, parseIntFromProcess } from '..'

export const config: ConfigOverride = () => ({
  appName: 'https-apps-worker-dev',
  api: {
    certPath: process.env.NODE_PATH_CERT ?? '../cert.pem',
    keyCertPath: process.env.NODE_PATH_KEY_CERT ?? '../key.pem',
  },
  database: {
    debug: true,
    clientUrl: process.env.NODE_DATABASE_URL ?? 'mysql://root:password@0.0.0.0:32800/precision-fda',
  },
  logs: {
    pretty: true,
    maskSensitive: false,
  },
  devFlags: {
    middleware: {
      skipUserMiddlewareForDebugRoutes: true,
    },
    fda: {
      skipFdaSubnetIpCheck: true,
    },
  },
  workerJobs: {
    syncJob: {
      repeatPattern: '*/1 * * * *', // Every 1 minute
      staleJobsEmailAfter: parseIntFromProcess(process.env.NODE_STALE_JOBS_EMAIL_AFTER) ?? 60 * 2, // 2 minutes
      staleJobsTerminateAfter:
        parseIntFromProcess(process.env.NODE_STALE_JOBS_TERMINATE_AFTER) ?? 24 * 60 * 60 * 10, // 10 days
      nonTerminatedDbClusters: {
        repeatPattern: process.env.NODE_NON_TERMINATED_DB_CLUSTERS_CRON ?? '0 6 * * *',
      },
      adminDataConsistencyReport: {
        // To test this locally, override the default config, e.g.:
        // repeatPattern: '16 * * * *', // Once an hour
      },
    },
    queues: {
      maintenance: {
        onInit: {
          // Also override the repeatPattern to test locally
          adminDataConsistencyReport: true,
          checkNonterminatedClusters: true,
          userInactivityAlert: true,
        },
      },
    },
  },
  redis: {
    url: process.env.NODE_REDIS_URL ?? 'redis://0.0.0.0:6379/0',
    isSecure: false,
  },
  emails: {
    smtp: {
      saveEmailToFile: true,
    },
  },
  bullBoardEnabled: true,
  nestjsDevtoolsEnabled: true,
})
