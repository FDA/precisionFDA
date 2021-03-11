import { ConfigOverride } from '..'

export const config: ConfigOverride = {
  appName: 'https-apps-worker-local',
  database: {
    debug: true,
  },
  logs: {
    pretty: true,
  },
  redis: {
    isSecure: false,
  },
}
