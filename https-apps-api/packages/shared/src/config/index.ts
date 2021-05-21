// eslint-disable-next-line import/no-named-default
import { default as dotenv } from 'dotenv'

// load process.env values
dotenv.config()

// eslint-disable-next-line import/first, import/order
import path from 'path'
// eslint-disable-next-line import/first
import { mergeDeepRight } from 'ramda'
// eslint-disable-next-line import/first
import { ENVS } from '../enums'
// eslint-disable-next-line import/first
import { DeepPartial } from '../types'
// eslint-disable-next-line import/first
import * as overrides from './envs'

type Maybe<T> = T | null

const parseIntFromProcess = (envValue: string | undefined): Maybe<number> => {
  const value = parseInt(envValue, 10)
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
    railsHost: 'https://localhost:3000',
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
  },
  platform: {
    apiUrl: 'https://stagingapi.dnanexus.com',
    authApiUrl: 'https://stagingauth.dnanexus.com',
    adminUser: 'precisionfda.admin_dev',
    findDataObjectsQueryLimit: 100,
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
    },
    syncJob: {
      // every two minutes
      // repeatPattern: '*/2 * * * *',
      repeatPattern: '*/1 * * * *',
    },
  },
}

// plug-in the overrides that are based on the NODE_ENV
const envOverride = overrides?.[env] ? overrides[env] : {}
const config: typeof defaultConfig = mergeDeepRight(defaultConfig, envOverride)
Object.freeze(config)

export type ConfigOverride = DeepPartial<typeof defaultConfig>

export { config, defaultConfig }
