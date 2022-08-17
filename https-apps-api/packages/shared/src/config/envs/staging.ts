import { ConfigOverride } from '..'

export const config: ConfigOverride = {
  appName: 'https-apps-worker-stg',
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
      staleJobsEmailAfter: process.env.NODE_STALE_JOBS_EMAIL_AFTER ?? 60*50, // 50 minutes
      staleJobsTerminateAfter: process.env.NODE_STALE_JOBS_TERMINATE_AFTER ?? 60*60, // 1 hour
    },
    queues: {
      default: { name: 'https-apps-worker-queue-stg' },
      fileSync: { name: 'https-apps-worker-fileSync-queue-stg' },
      emails: { name: 'https-apps-worker-emails-queue-stg' },
    },
  },
  platform: {
    orgEveryoneHandle: 'precisionfda',
  },
  redis: {
    isSecure: true,
  },
  shouldAddCheckNonterminatedClustersOnInit: true
}
