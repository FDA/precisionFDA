import type { JSONSchema7 } from 'json-schema'
import { config } from '../../config'
import { schemas } from '../../utils'
import { APP_HTTPS_SUBTYPE } from '../app/app.enum'
import { Job } from './job.entity'
import { allowedFeatures, allowedInstanceTypes } from './job.enum'

type DxIdInput = {
  dxid: string
}

type RunAppInput = {
  scope: string
  httpsAppType: APP_HTTPS_SUBTYPE
  name?: string
  instanceType?: string
  input?: {
    snapshot: string
    feature?: string
    duration?: number
    cmd?: string
    imagename?: string
  }
  appDxId: string
}

type DescribeJobInput = DxIdInput & {
  appId?: number
}

type ListJobsInput = {
  page: number
  limit: number
}

type PageJobs = {
  data: Job[]
  meta: {
    currentPage: number
    nextPage: number
    totalCount: number
    limit: number
  }
}

const runAppSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    httpsAppType: { type: 'string', enum: Object.values(APP_HTTPS_SUBTYPE) },
    instanceType: { type: 'string', enum: Object.keys(allowedInstanceTypes) },
    scope: { type: 'string', maxLength: config.validation.maxStrLen },
    name: { type: 'string', maxLength: config.validation.maxStrLen },
    input: {
      type: 'object',
      additionalProperties: false,
      required: [],
      // these inputs are for jupyter app only
      properties: {
        duration: { type: 'integer', minimum: 30, maximum: 5 * 60 },
        snapshot: { type: 'string', maxLength: config.validation.maxStrLen },
        feature: {
          type: 'string',
          enum: Object.keys(allowedFeatures),
          default: allowedFeatures.python,
        },
        imagename: { type: 'string', maxLength: config.validation.maxStrLen },
        cmd: { type: 'string', maxLength: config.validation.maxStrLen },
      },
    },
  },
  required: ['httpsAppType', 'scope'],
  additionalProperties: false,
}

const jobIdAppIdSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    dxid: schemas.dxidProp,
    appDxId: schemas.dxidProp,
  },
  required: ['dxid', 'appDxId'],
  additionalProperties: false,
}

export {
  runAppSchema,
  RunAppInput,
  jobIdAppIdSchema,
  DxIdInput,
  DescribeJobInput,
  ListJobsInput,
  PageJobs,
}
