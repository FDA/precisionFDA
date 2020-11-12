import type { JSONSchema7 } from 'json-schema'
import { config } from '../../config'
import { schemas } from '../../utils'
import { APP_HTTPS_SUBTYPE } from '../app/app.enum'
import { allowedFeatures, allowedInstanceTypes } from './job.enum'

type DxIdInput = {
  dxid: string
}

type RunAppInput = {
  projectId: string
  name?: string
  appDxId: string
  httpsAppType: APP_HTTPS_SUBTYPE
  instanceType: string
  feature: string
  duration: number
}

type DescribeJobInput = DxIdInput & {
  appId?: number
}

const runAppSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    httpsAppType: { type: 'string', enum: Object.values(APP_HTTPS_SUBTYPE) },
    projectId: { type: 'string', maxLength: config.validation.maxStrLen },
    instanceType: { type: 'string', enum: Object.keys(allowedInstanceTypes) },
    // hours it can run
    duration: { type: 'integer', minimum: 30, maximum: 5 * 60 },
    feature: {
      type: 'string',
      enum: Object.keys(allowedFeatures),
      default: allowedFeatures.python,
    },
  },
  required: ['instanceType', 'duration', 'httpsAppType'],
}

const jobIdAppIdSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    dxid: schemas.dxidProp,
    appDxId: schemas.dxidProp,
  },
  required: ['dxid', 'appDxId'],
}

export { runAppSchema, RunAppInput, jobIdAppIdSchema, DxIdInput, DescribeJobInput }
