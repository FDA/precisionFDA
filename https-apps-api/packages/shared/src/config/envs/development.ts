import { ConfigOverride } from '..'

export const config: ConfigOverride = {
  appName: 'https-apps-worker-dev',
  logs: {
    pretty: false,
    level: 'debug',
  },
  workerJobs: {
    syncJob: {
      repeatPattern: '*/2 * * * *',
    },
  },
}
