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
  },
  redis: {
    isSecure: true,
  },
}
