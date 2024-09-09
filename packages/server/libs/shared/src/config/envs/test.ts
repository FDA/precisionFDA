import { ConfigOverride, parseIntFromProcess } from '..'

export const config: ConfigOverride = () => ({
  appName: 'https-apps-worker-test',
  api: {
    railsHost: process.env.HOST,
  },
  workerJobs: {
    syncJob: {
      repeatPattern: '*/2 * * * *', // Every 2 minutes
      staleJobsEmailAfter: parseIntFromProcess(process.env.NODE_STALE_JOBS_EMAIL_AFTER) ?? 60 * 50, // 50 minutes
      staleJobsTerminateAfter:
        parseIntFromProcess(process.env.NODE_STALE_JOBS_TERMINATE_AFTER) ?? 60 * 60, // 1 hour
    },
    queues: {
      default: { name: 'https-apps-worker-queue-test' },
      fileSync: { name: 'https-apps-worker-fileSync-queue-test' },
      emails: { name: 'https-apps-worker-emails-queue-test' },
      maintenance: {
        onInit: {
          adminDataConsistencyReport: true,
          checkNonterminatedClusters: true,
          userInactivityAlert: true,
        },
      },
    },
  },
  platform: {
    orgEveryoneHandle: 'precisionfda',
  },
  redis: {
    isSecure: true,
  },
  siteSettings: {
    ssoButton: {
      isEnabled: true,
    },
  },
})
