import { ConfigOverride } from '..'

export const config: ConfigOverride = {
  appName: 'https-apps-worker-stg',
  logs: {
    pretty: false,
    level: 'debug',
  },
  workerJobs: {
    syncJob: {
      repeatPattern: '*/2 * * * *',
    },
    queues: {
      default: { name: 'https-apps-worker-queue-stg' },
    },
  },
  redis: {
    isSecure: true,
  },
}
