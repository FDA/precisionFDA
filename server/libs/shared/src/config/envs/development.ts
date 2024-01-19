import { ConfigOverride, parseIntFromProcess } from '..'

export const config: ConfigOverride = () => ({
  appName: 'https-apps-worker-dev',
  api: {
    railsHost: process.env.HOST,
    certPath: process.env.NODE_PATH_CERT ?? '../cert.pem',
    keyCertPath: process.env.NODE_PATH_KEY_CERT ?? '../key.pem',
  },
  database: {
    clientUrl: process.env.NODE_DATABASE_URL ?? 'mysql://root:password@0.0.0.0:32800/precision-fda',
  },
  logs: {
    pretty: false,
    level: 'debug',
  },
  devFlags: {
    middleware: {
      skipUserMiddlewareForDebugRoutes: true,
    },
    fda: {
      skipFdaSubnetIpCheck: true,
    },
  },
  workerJobs: {
    syncJob: {
      repeatPattern: '*/2 * * * *', // Every 2 minutes
      staleJobsEmailAfter: parseIntFromProcess(process.env.NODE_STALE_JOBS_EMAIL_AFTER) ?? 60 * 9, // 9 minutes
      staleJobsTerminateAfter: parseIntFromProcess(process.env.NODE_STALE_JOBS_TERMINATE_AFTER) ?? 60 * 10, // 10 minutes
    },
    queues: {
      default: { name: 'https-apps-worker-queue' },
      emails: { name: 'https-apps-worker-emails-queue-dev' },
      maintenance: {
        onInit: {
          adminDataConsistencyReport: false,
          checkNonterminatedClusters: false,
        },
      },
    },
  },
  redis: {
    url: process.env.NODE_REDIS_URL ?? 'redis://0.0.0.0:6379/0',
    isSecure: false,
  },
  emails: {
    smtp: {
      saveEmailToFile: false,
    },
  },
  bullBoardEnabled: true,
})
