import { parseIpv4Cidr } from '../../validation/parsers'
import { ConfigOverride } from '..'
import { MAX_JOB_DURATION_MINUTES } from '../constants'

export const config: ConfigOverride = () => ({
  appName: 'https-apps-worker-prod',
  api: {
    railsHost: process.env.HOST,
    allowErrorTestingRoutes: false,
    fdaSubnet: {
      allowedIpCidrBlock: parseIpv4Cidr(process.env.NODE_FDA_SUBNET_CIDR_BLOCK),
    },
  },
  logs: {
    pretty: false,
    level: 'info',
    maskSensitive: true,
  },
  workerJobs: {
    syncJob: {
      repeatPattern: '*/2 * * * *', // Every 2 minutes
      staleJobsEmailAfter: process.env.NODE_STALE_JOBS_EMAIL_AFTER ?? 60*60*24*29, // 29 days
      staleJobsTerminateAfter: process.env.NODE_STALE_JOBS_TERMINATE_AFTER ?? MAX_JOB_DURATION_MINUTES,
    },
    queues: {
      default: { name: 'https-apps-worker-queue-prod' },
      fileSync: { name: 'https-apps-worker-fileSync-queue-prod' },
      emails: { name: 'https-apps-worker-emails-queue-prod' },
    },
  },
  platform: {
    apiUrl: 'https://api.dnanexus.com',
    authApiUrl: 'https://auth.dnanexus.com',
    challengeBotUser: 'challenge.bot',
    orgEveryoneHandle: 'precisionfda',
  },
  redis: {
    isSecure: true,
  },
  siteSettings: {
    ssoButton: {
      response: {
        isEnabled: true,
        data: {
          fdaSsoUrl: 'https://sso2.fda.gov/idp/startSSO.ping?PartnerSpId=https%3A%2F%2Fwww.okta.com%2Fsaml2%2Fservice-provider%2Fspnozlcthxbiyuqzipze&TargetResource=https%3A%2F%2Fplatform.dnanexus.com%2Flogin%3Fiss%3Dhttps%3A%2F%2Fsso.dnanexus.com%26redirect_uri%3Dhttps%3A%2F%2Fprecision.fda.gov%2Freturn_from_login%26client_id%3Dprecision_fda_gov%26scope%3D%7B%22full%22%3A%2Btrue%7D',
        },
      },
    },
    cdmh: {
      response: {
        isEnabled: false,
      },
    },
  },
})
