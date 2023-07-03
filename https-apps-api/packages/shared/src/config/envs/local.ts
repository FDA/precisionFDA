import { ConfigOverride, parseIntFromProcess } from '..'

export const config: ConfigOverride = () => ({
  appName: 'https-apps-worker-local',
  database: {
    debug: true,
  },
  logs: {
    pretty: true,
    maskSensitive: false,
  },
  redis: {
    isSecure: false,
  },
  emails: {
    smtp: {
      saveEmailToFile: true,
    },
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
    queues: {
      maintenance: {
        onInit: {
          // Also override the repeatPattern to test locally
          adminDataConsistencyReport: true,
          checkNonterminatedClusters: true,
        },
      },
    },
    syncJob: {
      repeatPattern: '*/1 * * * *', // Every 1 minute
      staleJobsEmailAfter: parseIntFromProcess(process.env.NODE_STALE_JOBS_EMAIL_AFTER) ?? 60 * 2, // 2 minutes
      staleJobsTerminateAfter: parseIntFromProcess(process.env.NODE_STALE_JOBS_TERMINATE_AFTER) ?? 24 * 60 * 60 * 10, // 10 days
    },
    nonTerminatedDbClusters: {
      repeatPattern: process.env.NODE_NON_TERMINATED_DB_CLUSTERS_CRON ?? '0 6 * * *',
    },
    adminDataConsistencyReport: {
      // To test this locally, override the default config, e.g.:
      // repeatPattern: '16 * * * *', // Once an hour
    },
  },
})
