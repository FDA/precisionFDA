import { ConfigOverride, parseIntFromProcess } from '..'
import { parseIpv4Cidr } from '../../validation/parsers'

export const config: ConfigOverride = () => ({
  appName: 'https-apps-worker-stg',
  api: {
    railsHost: process.env.HOST,
    fdaSubnet: {
      allowedIpCidrBlock: parseIpv4Cidr(process.env.NODE_FDA_SUBNET_CIDR_BLOCK),
    },
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
          checkNonterminatedClusters: true,
          userInactivityAlert: true
        },
      },
    },
  },
  platform: {
    orgEveryoneHandle: 'precisionfda',
  },
  redis: {
    isSecure: true,
  },
  siteSettings: {
    ssoButton: {
        isEnabled: true,
    },
  },
})
