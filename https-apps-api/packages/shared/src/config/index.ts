// eslint-disable-next-line import/no-named-default
import { default as dotenv } from 'dotenv'

// load process.env values
dotenv.config()

// eslint-disable-next-line import/first
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
    port: parseIntFromProcess(process.env.PORT) ?? 3001,
    certPath: process.env.PATH_CERT ?? path.join(__dirname, '../../../../cert.pem'),
    keyCertPath: process.env.PATH_KEY_CERT ?? path.join(__dirname, '../../../../key.pem'),
  },
  logs: {
    pretty: true,
    level: 'debug',
  },
  database: {
    // dbName: process.env.DATABASE_NAME ?? 'precision-fda',
    clientUrl: process.env.DATABASE_URL ?? 'mysql://root:password@localhost:3306/precision-fda',
    debug: parseBooleanFromProcess(process.env.DATABASE_DEBUG) ?? false,
  },
  validation: {
    maxStrLen: 255,
    maxIdStrLen: 64,
  },
  platform: {
    apiUrl: 'https://stagingapi.dnanexus.com',
    authApiUrl: 'https://stagingauth.dnanexus.com',
    adminUser: 'precisionfda.admin_dev',
  },
  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  },
  workerJobs: {
    queues: {
      default: {
        name: 'https-apps-worker-queue',
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
