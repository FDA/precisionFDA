import { ConfigOverride } from '..'

export const config: ConfigOverride = {
  appName: 'https-apps-worker-local',
  database: {
    debug: true,
  },
  logs: {
    pretty: true,
    maskSensitive: false,
  },
  redis: {
    isSecure: false,
  },
  emails: {
    salesforce: {
      isEnabled: false,
    },
  },
}
