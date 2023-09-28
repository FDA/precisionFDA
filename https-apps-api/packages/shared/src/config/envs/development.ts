import { ConfigOverride, parseIntFromProcess } from '..'

export const config: ConfigOverride = () => ({
  appName: 'https-apps-worker-dev',
  api: {
    railsHost: process.env.HOST,
  },
  logs: {
    pretty: false,
    level: 'debug',
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
      repeatPattern: '*/2 * * * *', // Every 2 minutes
      staleJobsEmailAfter: parseIntFromProcess(process.env.NODE_STALE_JOBS_EMAIL_AFTER) ?? 60 * 9, // 9 minutes
      staleJobsTerminateAfter: parseIntFromProcess(process.env.NODE_STALE_JOBS_TERMINATE_AFTER) ?? 60 * 10, // 10 minutes
    },
    queues: {
      default: { name: 'https-apps-worker-queue' },
      emails: { name: 'https-apps-worker-emails-queue-dev' },
      maintenance: {
        onInit: {
          adminDataConsistencyReport: false,
          checkNonterminatedClusters: false,
        },
      },
    },
  },
  redis: {
    isSecure: false,
  },
  emails: {
    smtp: {
      saveEmailToFile: false,
    },
  },
})
