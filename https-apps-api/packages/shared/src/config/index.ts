// eslint-disable-next-line import/no-named-default
import { default as dotenv } from 'dotenv'

// load process.env values
dotenv.config()

// eslint-disable-next-line import/first
import { mergeDeepRight } from 'ramda'
// eslint-disable-next-line import/first
import { ENVS } from '../enums'
// eslint-disable-next-line import/first
import { DeepPartial } from '../types'
// eslint-disable-next-line import/first
import * as overrides from './envs'

type Maybe<T> = T | null

const parseIntFromProcess = (envVarName: string): Maybe<number> => {
  const value = parseInt(process.env[envVarName], 10)
  return isNaN(value) ? null : value
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const parseBooleanFromProcess = (value: string, defaultValue = false): boolean =>
  value ? value.toLowerCase() === 'true' : defaultValue

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
const env = (process.env.NODE_ENV ?? ENVS.LOCAL) as ENVS
const defaultConfig = {
  appName: 'foo-app-name',
  env,
  api: {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    port: parseIntFromProcess(process.env.PORT) ?? 3001,
  },
  logs: {
    pretty: true,
    level: 'debug',
  },
  database: {
    dbName: 'precision-fda',
    clientUrl: 'mysql://root:password@localhost:3306',
    debug: false,
  },
  validation: {
    maxStrLen: 255,
    maxIdStrLen: 64,
  },
  platform: {
    apiUrl: 'https://stagingapi.dnanexus.com',
    authApiUrl: 'https://stagingauth.dnanexus.com',
  },
}

// plug-in the overrides that are based on the NODE_ENV
const envOverride = overrides?.[env] ? overrides[env] : {}
const config: typeof defaultConfig = mergeDeepRight(defaultConfig, envOverride)
Object.freeze(config)

export type ConfigOverride = DeepPartial<typeof defaultConfig>

export { config, defaultConfig }
