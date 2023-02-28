/* eslint-disable no-warning-comments */
/* eslint-disable max-len */
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
// eslint-disable-next-line import/first
import { MAX_JOB_DURATION_MINUTES } from './constants'
// eslint-disable-next-line import/first
import * as overrides from './envs'

type Maybe<T> = T | null

const parseIntFromProcess = (envValue: string | undefined): Maybe<number> => {
  // TODO(samuel) validate that this is not undefined
  if(envValue) {
    const value = parseInt(envValue, 10)
    return isNaN(value) ? null : value
  }
  return null
}
const parseBooleanFromProcess = (
  value: string | undefined,
  defaultValue = false,
): boolean => value ? value.toLowerCase() === 'true' : defaultValue

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
const env = (process.env.NODE_ENV ?? ENVS.LOCAL) as ENVS
const defaultConfig = {
  appName: 'https-apps-worker',
  env,
  api: {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    port: parseIntFromProcess(process.env.NODE_PORT) ?? 3001,
    certPath:
      process.env.NODE_PATH_CERT
      ?? path.join(__dirname, '../../../../cert.pem'),
    keyCertPath:
      process.env.NODE_PATH_KEY_CERT
      ?? path.join(__dirname, '../../../../key.pem'),
    railsHost: process.env.HOST ?? 'https://localhost:3000',
    // TODO - refactor to boolean
    allowErrorTestingRoutes:
      process.env.NODE_ALLOW_ERROR_TESTING_ROUTES ?? true,
    fdaSubnet: {
      allowedIpCidrBlock: {
        ipv4Quadruple: [127, 0, 0, 1],
        maskSize: 0,
      },
      nginxIpHeader: 'X-Forwarded-For',
    },
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
      process.env.NODE_DATABASE_URL
      ?? 'mysql://root:password@localhost:3306/precision-fda',
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
    challengeBotUser: 'challenge.bot.2',
    challengeBotAccessToken: process.env.CHALLENGE_BOT_TOKEN ?? '',
    findDataObjectsQueryLimit: 1000,
    orgEveryoneHandle: 'precisionfda_dev',
  },
  emails: {
    smtp: {
      isEnabled: true,
      username: process.env.SMTP_USER ?? 'aws-ses-username',
      password: process.env.SMTP_PASSWORD ?? 'aws-ses-password',
      port: process.env.SMTP_PORT ?? 'aws-ses-port',
      host: process.env.SMTP_HOST ?? 'aws-ses-host',
      fromAddress: process.env.SMTP_FROM_ADDRESS ?? 'precisionfda-no-reply@dnanexus.com',
    },
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
        name: 'https-apps-worker-filesSync-queue',
      },
      maintenance: {
        name: 'https-apps-worker-maintenance-queue',
        onInit: {
          shouldAddCheckNonterminatedClusters: false,
        },
      },
    },
    syncDbClusters: {
      repeatPattern: '*/1 * * * *', // Every minute
    },
    syncFiles: {
      repeatPattern: '*/15 * * * * *', // Every 15 seconds
    },
    syncJob: {
      // every two minutes
      // repeatPattern: '*/2 * * * *',
      repeatPattern: '*/1 * * * *',
      staleJobsEmailAfter:
        process.env.NODE_STALE_JOBS_EMAIL_AFTER ?? 60 * 60 * 24 * 29, // 29 days
      staleJobsTerminateAfter:
        process.env.NODE_STALE_JOBS_TERMINATE_AFTER ?? MAX_JOB_DURATION_MINUTES,
    },
    nonTerminatedDbClusters: {
      repeatPattern: '0 6 * * *',
    },
  },
  // TODO(samuel) apply "satisfies" operator
  // https://devblogs.microsoft.com/typescript/announcing-typescript-4-9-beta/#the-satisfies-operator
  siteSettings: {
    ssoButton: {
      // TODO: Remove use of thse settings to configure middleware, these checks should just be hard-coded
      middleware: {
        shouldCheckFdaSubnet: true,
        shouldRequireUserSession: false,
      },
      response: {
        isEnabled: false,
        data: {
          fdaSsoUrl: 'https://sso2.fda.gov/idp/startSSO.ping?PartnerSpId=https%3A%2F%2Fwww.okta.com%2Fsaml2%2Fservice-provider%2Fspllmwzmzinhnfpurqly&TargetResource=https%3A%2F%2Fstaging.dnanexus.com%2Flogin%3Fiss%3Dhttps%3A%2F%2Fsso-staging.dnanexus.com%26redirect_uri%3Dhttps%3A%2F%2Fprecisionfda-staging.dnanexus.com%2Freturn_from_login%26client_id%3Dprecision_fda_gov%26scope%3D%7B%22full%22%3A%2Btrue%7D',
        },
      },
    },
    cdmh: {
      // TODO: Remove use of thse settings to configure middleware, these checks should just be hard-coded
      middleware: {
        shouldCheckFdaSubnet: true,
        shouldRequireUserSession: true,
      },
      response: {
        isEnabled: true,
        data: {
          cdmhPortal: 'https://cdmh-portal.precisionfda-dev.dnanexus.com/',
          cdrBrowser: 'https://smilecdr.precisionfda-dev.dnanexus.com/',
          cdrAdmin: 'https://smilecdr.precisionfda-dev.dnanexus.com/',
          connectPortal: 'https://adeptia-portal.precisionfda-dev.dnanexus.com/',
        },
      },
    },
  },
  recaptcha: {
    projectId: process.env.RECAPTCHA_PROJECT_ID,
    siteKey: process.env.RECAPTCHA_SITE_KEY,
    apiKey: process.env.RECAPTCHA_API_KEY,
  },
  devFlags: {
    middleware: {
      skipUserMiddlewareForDebugRoutes: false,
    },
    fda: {
      skipFdaSubnetIpCheck: false,
    },
  },
}

// lazily plug-in the overrides that are based on the NODE_ENV
const envOverride = overrides[env] ? overrides[env]() : {}
const config: typeof defaultConfig = mergeDeepRight(defaultConfig, envOverride) as any
Object.freeze(config)

export type ConfigOverride = () => DeepPartial<typeof defaultConfig>

export { config, defaultConfig }
