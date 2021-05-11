import { ConfigOverride } from '..'

export const config: ConfigOverride = {
  appName: 'https-apps-worker-prod',
  logs: {
    pretty: false,
    level: 'info',
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
  redis: {
    isSecure: true,
  },
}
