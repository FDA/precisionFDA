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
      repeatPattern: '*/2 * * * *',
    },
    queues: {
      default: { name: 'https-apps-worker-queue-dev' },
      emails: { name: 'https-apps-worker-emails-queue-dev' },
    },
  },
  redis: {
    isSecure: true,
  },
  emails: {
    salesforce: {
      isEnabled: false,
    },
  },
}
