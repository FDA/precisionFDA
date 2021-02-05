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
  },
  redis: {
    isSecure: true,
  },
}
