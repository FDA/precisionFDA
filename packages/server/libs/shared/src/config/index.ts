/* eslint-disable no-warning-comments */
import { parseEnumValueFromString } from '@shared/validation/parsers'
/* eslint-disable max-len */
import { default as dotenv } from 'dotenv'
import path from 'path'

// load process.env values
dotenv.config()

import { mergeDeepRight } from 'ramda'
import { ENVS } from '../enums'
import { DeepPartial } from '../types'
import { MAX_JOB_DURATION_SECONDS } from './constants'
import * as overrides from './envs'

type Maybe<T> = T | null

export const parseIntFromProcess = (envValue: string | undefined): Maybe<number> => {
  // TODO(samuel) validate that this is not undefined
  if (envValue) {
    const value = parseInt(envValue, 10)
    return isNaN(value) ? null : value
  }
  return null
}
const parseBooleanFromProcess = (value: string | undefined, defaultValue = false): boolean =>
  value ? value.toLowerCase() === 'true' : defaultValue

const getEnv = () => {
  try {
    return parseEnumValueFromString(Object.values(ENVS))(process.env.NODE_ENV)
  } catch {
    throw new Error(`NODE_ENV value "${process.env.NODE_ENV}" is not a valid environment`)
  }
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
const env = getEnv()

const defaultConfig = {
  appName: 'https-apps-worker',
  env,
  api: {
    port: parseIntFromProcess(process.env.NODE_PORT) ?? 3001,
    appKit: 'project-GVg2Zg80fQb20gg39J507VYx:/appKit-1.2.tgz',
    enableSsl: parseBooleanFromProcess(process.env.NODE_ENABLE_SSL, true),
    certPath: process.env.NODE_PATH_CERT ?? path.join(__dirname, '../../../../cert.pem'),
    keyCertPath: process.env.NODE_PATH_KEY_CERT ?? path.join(__dirname, '../../../../key.pem'),
    url: process.env.NODE_URL ?? 'https://nodejs-api',
    railsHost: process.env.HOST ?? 'https://localhost:3000',
    // TODO - refactor to boolean
    allowErrorTestingRoutes: parseBooleanFromProcess(
      process.env.NODE_ALLOW_ERROR_TESTING_ROUTES,
      true,
    ),
    fdaSubnet: {
      allowedIpCidrBlock: {
        ipv4Quadruple: [127, 0, 0, 1],
        maskSize: 0,
      },
      nginxIpHeader: 'x-forwarded-for',
    },
  },
  logs: {
    pretty: false,
    level: 'trace',
    maskSensitive: true,
    enableStackLogging: true,
  },
  database: {
    dbName: process.env.NODE_DATABASE_NAME ?? 'precisionfda-test',
    clientUrl:
      process.env.NODE_DATABASE_URL ?? 'mysql://root:password@localhost:32800/precisionfda-test',
    debug: parseBooleanFromProcess(process.env.NODE_DATABASE_DEBUG) ?? false,
  },
  validation: {
    maxStrLen: 255,
    maxIdStrLen: 64,
    maxJobDurationMinutes: Math.ceil(MAX_JOB_DURATION_SECONDS / 60),
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
      saveEmailToFile: false,
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
      spaceReport: {
        name: 'https-apps-worker-spaceReport-queue',
      },
      maintenance: {
        name: 'https-apps-worker-maintenance-queue',
        onInit: {
          checkNonterminatedClusters: true,
          userInactivityAlert: false,
          adminDataConsistencyReport: false,
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
      repeatPattern: '*/15 * * * * *', // Every 15 seconds
      staleJobsEmailAfter:
        parseIntFromProcess(process.env.NODE_STALE_JOBS_EMAIL_AFTER) ?? 60 * 60 * 24 * 29, // 29 days
      staleJobsTerminateAfter:
        parseIntFromProcess(process.env.NODE_STALE_JOBS_TERMINATE_AFTER) ??
        MAX_JOB_DURATION_SECONDS,
    },
    nonTerminatedDbClusters: {
      repeatPattern: '0 6 * * *', // Once a day at 6am
    },
    userInactivityAlert: {
      inactiveDaysThreshold: 55, // alert users who haven't logged in for X days
      repeatPattern: '30 14 * * 1-5', // workdays at 2:30 PM (UTC)
    },
    checkChallengeJobs: {
      repeatPattern: '*/5 * * * *', // Every 5 minutes
    },
    adminDataConsistencyReport: {
      repeatPattern: process.env.NODE_ADMIN_DATA_REPORT_REPEAT ?? '0 1 * * 0', // Once a week on Sunday at 1am
    },
    userDataConsistencyReport: {
      repeatSeconds: parseIntFromProcess(process.env.USER_DATA_CONSISTENCY_REPORT_REPEAT) ?? 604800, // At least one week between checks
    },
    spaceReport: {
      partBatchSize: parseIntFromProcess(process.env.NODE_SPACE_REPORT_PART_BATCH_SIZE) ?? 20,
    },
  },
  // TODO(samuel) apply "satisfies" operator
  // https://devblogs.microsoft.com/typescript/announcing-typescript-4-9-beta/#the-satisfies-operator
  siteSettings: {
    ssoButton: {
      isEnabled: false,
      data: {
        fdaSsoUrl:
          'https://sso2.fda.gov/idp/startSSO.ping?PartnerSpId=https%3A%2F%2Fwww.okta.com%2Fsaml2%2Fservice-provider%2Fspllmwzmzinhnfpurqly&TargetResource=https%3A%2F%2Fstaging.dnanexus.com%2Flogin%3Fiss%3Dhttps%3A%2F%2Fsso-staging.dnanexus.com%26redirect_uri%3Dhttps%3A%2F%2Fprecisionfda-staging.dnanexus.com%2Freturn_from_login%26client_id%3Dprecision_fda_gov%26scope%3D%7B%22full%22%3A%2Btrue%7D',
      },
    },
    cdmh: {
      isEnabled: true,
      data: {
        cdmhPortal: process.env.CDMH_PORTAL_URL,
        cdrBrowser: process.env.CDMH_CDR_BROWSER_URL,
        cdrAdmin: process.env.CDMH_CDR_ADMIN_URL,
        connectPortal: process.env.CDMH_CONNECT_PORTAL_URL,
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
  defaultJobOptions: {
    attempts: 15, // 9 hours and 7 minutes
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
  bullBoardEnabled: parseBooleanFromProcess(process.env.NODE_BULL_BOARD_ENABLED) ?? false,
  nestjsDevtoolsEnabled: parseBooleanFromProcess(process.env.NODE_NEST_DEV_TOOLS_ENABLED) ?? false,
  service: {
    adminPlatformClient: {
      url: process.env.NODE_ADMIN_PLATFORM_CLIENT_URL || 'http://localhost:3002',
    },
  },
  secretKeyBase: process.env.SECRET_KEY_BASE,
  maxTimeInactivity: parseIntFromProcess(process.env.MAX_TIME_INACTIVITY) ?? 30,
}

// lazily plug-in the overrides that are based on the NODE_ENV
const envOverride = overrides[env] ? overrides[env]() : {}
const config: typeof defaultConfig = mergeDeepRight(defaultConfig, envOverride) as any
Object.freeze(config)

export type ConfigOverride = () => DeepPartial<typeof defaultConfig>

export { config, defaultConfig }
