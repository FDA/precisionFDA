import { ConfigOverride } from '..'

export const config: ConfigOverride = {
  appName: 'https-apps-worker-local',
  logs: {
    pretty: true,
  },
  redis: {
    isSecure: false,
  },
}
