import { ConfigOverride } from '..'

export const config: ConfigOverride = {
  appName: 'https-apps-worker-prod',
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
