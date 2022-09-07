// eslint-disable-next-line import/no-named-default
import { default as dotenv } from 'dotenv'
// eslint-disable-next-line import/order
import path from 'path'

// load process.env values
dotenv.config()

// eslint-disable-next-line import/first
import { mergeDeepRight } from 'ramda'
// eslint-disable-next-line import/first
import { ENVS } from '../enums'
// eslint-disable-next-line import/first
import { DeepPartial } from '../types'
import { MAX_JOB_DURATION_MINUTES } from './constants'
// eslint-disable-next-line import/first
import * as overrides from './envs'

type Maybe<T> = T | null

const parseIntFromProcess = (envValue: string | undefined): Maybe<number> => {
  // TODO(samuel) validate that this is not undefined
  const value = parseInt(envValue!, 10)
  return isNaN(value) ? null : value
}

const parseBooleanFromProcess = (value: string | undefined, defaultValue = false): boolean =>
  value ? value.toLowerCase() === 'true' : defaultValue

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
const env = (process.env.NODE_ENV ?? ENVS.LOCAL) as ENVS
const defaultConfig = {
  appName: 'https-apps-worker',
  env,
  api: {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    port: parseIntFromProcess(process.env.NODE_PORT) ?? 3001,
    certPath: process.env.NODE_PATH_CERT ?? path.join(__dirname, '../../../../cert.pem'),
    keyCertPath: process.env.NODE_PATH_KEY_CERT ?? path.join(__dirname, '../../../../key.pem'),
    railsHost: process.env.HOST ?? 'https://localhost:3000',
    allowErrorTestingRoutes: process.env.NODE_ALLOW_ERROR_TESTING_ROUTES ?? true,
  },
  logs: {
    pretty: true,
    level: 'debug',
    maskSensitive: true,
  },
  database: {
    // it is used for testing, not for default DB connection
    dbName: process.env.NODE_DATABASE_NAME ?? 'precision-fda',
    clientUrl:
      process.env.NODE_DATABASE_URL ?? 'mysql://root:password@localhost:3306/precision-fda',
    debug: parseBooleanFromProcess(process.env.NODE_DATABASE_DEBUG) ?? false,
  },
  validation: {
    maxStrLen: 255,
    maxIdStrLen: 64,
    maxJobDurationMinutes: MAX_JOB_DURATION_MINUTES,
  },
  platform: {
    apiUrl: 'https://stagingapi.dnanexus.com',
    authApiUrl: 'https://stagingauth.dnanexus.com',
    adminUser: 'precisionfda.admin_dev',
    adminUserAccessToken: process.env.ADMIN_TOKEN ?? 'admin-token',
    findDataObjectsQueryLimit: 100,
    orgEveryoneHandle: 'precisionfda_dev',
  },
  emails: {
    salesforce: {
      isEnabled: true,
      apiUrl: process.env.SALESFORCE_HOST ?? 'https://dnanexus--pFDAemail.cs33.my.salesforce.com',
      username: process.env.SALESFORCE_USERNAME ?? 'sf-username',
      password: process.env.SALESFORCE_PASSWORD ?? 'sf-password',
      secretToken: process.env.SALESFORCE_SECRET_TOKEN ?? 'sf-secret',
      fromAddress: process.env.SALESFORCE_FDA_EMAIL_ID ?? 'sf-org-id',
    },
  },
  users: {
    challengeBotDxUser: 'challenge.bot.2',
  },
  redis: {
    url: process.env.NODE_REDIS_URL ?? 'redis://localhost:6379',
    isSecure: false,
    authPassword: process.env.NODE_REDIS_AUTH ?? 'redis-pswd-placeholder',
    connectTimeout: 30000,
  },
  workerJobs: {
    queues: {
      default: {
        name: 'https-apps-worker-queue',
      },
      emails: {
        name: 'https-apps-worker-emails-queue',
      },
      fileSync: {
        name: 'https-apps-worker-filesSync-queue'
      },
      maintenance: {
        name: 'https-apps-worker-maintenance-queue',
      },
    },
    syncJob: {
      // every two minutes
      // repeatPattern: '*/2 * * * *',
      repeatPattern: '*/1 * * * *',
      // Until PFDA-2431 is fixed, we prevent job termination warnings email from being sent out
      staleJobsEmailAfter: process.env.NODE_STALE_JOBS_EMAIL_AFTER ?? 60*60*24*30, // 30 days
      // staleJobsEmailAfter: process.env.NODE_STALE_JOBS_EMAIL_AFTER ?? 60*60*24*29, // 29 days
      staleJobsTerminateAfter: process.env.NODE_STALE_JOBS_TERMINATE_AFTER ?? MAX_JOB_DURATION_MINUTES,
    },
    nonTerminatedDbClusters: {
      repeatPattern: '0 6 * * *',
    }
  },
  flags: {
    dev: {
      skipUserMiddlewareForDebugRoutes: false
    }
  },
  // TODO(samuel) - replace this flag with array of initial tasks
  // TODO(samuel) - ideally replace ramda with better package that can deep-merge arrays in typescript
  shouldAddCheckNonterminatedClustersOnInit: false 
}

// plug-in the overrides that are based on the NODE_ENV
const envOverride = overrides?.[env] ? overrides[env] : {}
const config: typeof defaultConfig = mergeDeepRight(defaultConfig, envOverride)
Object.freeze(config)

export type ConfigOverride = DeepPartial<typeof defaultConfig>

export { config, defaultConfig }
