import { ConfigOverride } from '..'

export const config: ConfigOverride = {
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
    salesforce: {
      isEnabled: false,
    },
  },
  workerJobs: {
    syncJob: {
      repeatPattern: '*/1 * * * *', // Every 1 minute
      staleJobsEmailAfter: process.env.NODE_STALE_JOBS_EMAIL_AFTER ?? 60*2, // 2 minutes
      staleJobsTerminateAfter: process.env.NODE_STALE_JOBS_TERMINATE_AFTER ?? 24*60*60*10, // 10 days
    },
  },
}
