import { ConfigOverride } from '..'

export const config: ConfigOverride = {
  appName: 'https-apps-worker-prod',
  api: {
    railsHost: 'https://precision.fda.gov',
  },
  logs: {
    pretty: false,
    level: 'info',
    maskSensitive: true,
  },
  workerJobs: {
    syncJob: {
      repeatPattern: '*/2 * * * *',
    },
    queues: {
      default: { name: 'https-apps-worker-queue-prod' },
      emails: { name: 'https-apps-worker-emails-queue-prod' },
    },
  },
  platform: {
    apiUrl: 'https://api.dnanexus.com',
    authApiUrl: 'https://auth.dnanexus.com',
  },
  redis: {
    isSecure: true,
  },
}
