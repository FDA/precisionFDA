import { ConfigOverride, defaultConfig, parseBooleanFromProcess, parseIntFromProcess } from '..'
import { parseIpv4Cidr } from '../../validation/parsers'
import { MAX_JOB_DURATION_SECONDS } from '../constants'

export const config: ConfigOverride = () => ({
  appName: 'https-apps-worker-prod',
  api: {
    railsHost: process.env.HOST,
    allowErrorTestingRoutes: false,
    fdaSubnet: {
      allowedIpCidrBlock: parseIpv4Cidr(process.env.NODE_FDA_SUBNET_CIDR_BLOCK),
    },
    appKit: 'project-GYP09280XPx4p0gJ8XPY27b0:/appKit-1.2.tgz',
  },
  logs: {
    enableStackLogging: false,
  },
  workerJobs: {
    syncJob: {
      repeatPattern: '*/2 * * * *', // Every 2 minutes
      staleJobsEmailAfter:
        parseIntFromProcess(process.env.NODE_STALE_JOBS_EMAIL_AFTER) ?? 60 * 60 * 24 * 29, // 29 days
      staleJobsTerminateAfter:
        parseIntFromProcess(process.env.NODE_STALE_JOBS_TERMINATE_AFTER) ??
        MAX_JOB_DURATION_SECONDS,
    },
    queues: {
      default: { name: 'https-apps-worker-queue-prod' },
      fileSync: { name: 'https-apps-worker-fileSync-queue-prod' },
      emails: { name: 'https-apps-worker-emails-queue-prod' },
      maintenance: {
        onInit: {
          adminDataConsistencyReport: true,
          checkNonterminatedClusters: true,
          userInactivityAlert: true,
        },
      },
    },
  },
  platform: {
    apiUrl: process.env.API_URL ?? 'https://api.dnanexus.com',
    authApiUrl: process.env.AUTH_API_URL ?? 'https://auth.dnanexus.com',
    adminUser: 'precisionfda.admin',
    challengeBotUser: 'challenge.bot',
    orgEveryoneHandle: 'precisionfda',
  },
  emails: {
    report: 'pfda-reports-production@dnanexus.com',
  },
  redis: {
    isSecure: true,
  },
  siteSettings: {
    ssoButton: {
      isEnabled: parseBooleanFromProcess(process.env.SSO_ENABLED),
      data: {
        ssoUrl: process.env.SSO_URL,
      },
    },
    cdmh: {
      isEnabled: false,
    },
  },
  challengeProposalRecipients: [defaultConfig.pfdaEmail],
})
