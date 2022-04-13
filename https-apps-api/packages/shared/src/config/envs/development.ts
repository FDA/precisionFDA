import { ConfigOverride } from '..'

export const config: ConfigOverride = {
  appName: 'https-apps-worker-dev',
  api: {
    railsHost: process.env.HOST,
  },
  logs: {
    pretty: false,
    level: 'debug',
  },
  workerJobs: {
    syncJob: {
      repeatPattern: '*/2 * * * *', // Every 2 minutes
      staleJobsEmailAfter: process.env.NODE_STALE_JOBS_EMAIL_AFTER ?? 60*9, // 9 minutes
      staleJobsTerminateAfter: process.env.NODE_STALE_JOBS_TERMINATE_AFTER ?? 60*10, // 10 minutes
    },
    queues: {
      default: { name: 'https-apps-worker-queue-dev' },
      emails: { name: 'https-apps-worker-emails-queue-dev' },
    },
  },
  redis: {
    isSecure: false,
  },
  emails: {
    salesforce: {
      isEnabled: false,
    },
  },
}
