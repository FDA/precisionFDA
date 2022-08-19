import { ConfigOverride } from '..'
import { MAX_JOB_DURATION_MINUTES } from '../constants'

export const config: ConfigOverride = {
  appName: 'https-apps-worker-prod',
  api: {
    railsHost: process.env.HOST,
    allowErrorTestingRoutes: false,
  },
  logs: {
    pretty: false,
    level: 'info',
    maskSensitive: true,
  },
  workerJobs: {
    syncJob: {
      repeatPattern: '*/2 * * * *', // Every 2 minutes
      // Until PFDA-2431 is fixed, we prevent job termination warnings email from being sent out
      staleJobsEmailAfter: process.env.NODE_STALE_JOBS_EMAIL_AFTER ?? 60*60*24*30, // 30 days
      // staleJobsEmailAfter: process.env.NODE_STALE_JOBS_EMAIL_AFTER ?? 60*60*24*29, // 29 days
      staleJobsTerminateAfter: process.env.NODE_STALE_JOBS_TERMINATE_AFTER ?? MAX_JOB_DURATION_MINUTES,
    },
    queues: {
      default: { name: 'https-apps-worker-queue-prod' },
      fileSync: { name: 'https-apps-worker-fileSync-queue-prod' },
      emails: { name: 'https-apps-worker-emails-queue-prod' },
    },
  },
  platform: {
    apiUrl: 'https://api.dnanexus.com',
    authApiUrl: 'https://auth.dnanexus.com',
    orgEveryoneHandle: 'precisionfda',
  },
  redis: {
    isSecure: true,
  },
}
