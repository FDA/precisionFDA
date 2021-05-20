import { ConfigOverride } from '..'

export const config: ConfigOverride = {
  appName: 'https-apps-worker-stg',
  api: {
    railsHost: 'https://precisionfda-staging.dnanexus.com',
  },
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
      emails: { name: 'https-apps-worker-emails-queue-stg' },
    },
  },
  redis: {
    isSecure: true,
  },
}
