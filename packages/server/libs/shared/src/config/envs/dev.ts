import { parseIpv4Cidr } from '@shared/validation/parsers'
import { ConfigOverride, parseBooleanFromProcess, parseIntFromProcess } from '..'

export const config: ConfigOverride = () => ({
  // NOTE(samuel) copied from "staging.ts" configuration, so to avoid breaking changes, left unchanged
  appName: 'https-apps-worker-stg',
  api: {
    railsHost: process.env.HOST,
    fdaSubnet: {
      allowedIpCidrBlock: parseIpv4Cidr(process.env.NODE_FDA_SUBNET_CIDR_BLOCK),
    },
    captchaEnabled: true,
  },
  database: {
    printDBQueryValuesInLog:
      process.env.PRINT_DB_QUERY_VALUES_IN_LOG === undefined
        ? true
        : parseBooleanFromProcess(process.env.PRINT_DB_QUERY_VALUES_IN_LOG),
  },
  workerJobs: {
    syncJob: {
      repeatPattern: '*/2 * * * *', // Every 2 minutes
      staleJobsEmailAfter: parseIntFromProcess(process.env.NODE_STALE_JOBS_EMAIL_AFTER) ?? 60 * 50, // 50 minutes
      staleJobsTerminateAfter: parseIntFromProcess(process.env.NODE_STALE_JOBS_TERMINATE_AFTER) ?? 60 * 60, // 1 hour
    },
    queues: {
      default: { name: 'https-apps-worker-queue-stg' },
      fileSync: { name: 'https-apps-worker-fileSync-queue-stg' },
      emails: { name: 'https-apps-worker-emails-queue-stg' },
      maintenance: {
        onInit: {
          adminDataConsistencyReport: true,
          checkNonterminatedClusters: false,
          userInactivityAlert: true,
        },
      },
    },
  },
  redis: {
    isSecure: true,
  },
  siteSettings: {
    ssoButton: {
      isEnabled: true,
    },
  },
  emails: {
    smtp: {
      saveEmailToFile: false,
    },
  },
  challengeProposalRecipients: [],
})
