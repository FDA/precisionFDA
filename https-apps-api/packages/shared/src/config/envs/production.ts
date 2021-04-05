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
    },
  },
  redis: {
    isSecure: true,
  },
}
