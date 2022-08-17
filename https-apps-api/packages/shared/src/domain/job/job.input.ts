import type { JSONSchema7 } from 'json-schema'
import { config } from '../../config'
import { schemas } from '../../utils'
import { Job } from './job.entity'
import { allowedFeatures, allowedInstanceTypes } from './job.enum'


type DxIdInput = {
  dxid: string
}

type RunAppInput = {
  scope: string
  name?: string
  instanceType?: string
  jobLimit: number
  input?: {
    snapshot: string
    feature?: string
    duration?: number
    cmd?: string
    imagename?: string
    port?: number // ttyd
  }
  appDxId: string
}

type Provenance = {
  [k: string]: {
    app_dxid: string
    app_id: number
    inputs: { [k: string]: string }
  }
}

type DescribeJobInput = DxIdInput & {
  appId?: number
}

type ListJobsInput = {
  page: number
  limit: number
  scope?: string
  spaceId?: number
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

type WorkstationSyncFilesInput = {
  dxid: string
  force: boolean
}

const runAppSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    instanceType: { type: 'string', enum: Object.keys(allowedInstanceTypes) },
    jobLimit: { type: 'number', minimum: 0 },
    scope: { type: 'string', maxLength: config.validation.maxStrLen },
    name: { type: 'string', maxLength: config.validation.maxStrLen },
    // keeping this for now, since we do not have any other apps
    // but the contents of input field should be dynamic
    input: {
      type: 'object',
      additionalProperties: false,
      required: [],
      properties: {
        // these inputs are for jupyter app only (except of a 'port' input, that is for ttyd)
        duration: { type: 'integer', minimum: 30, maximum: config.validation.maxJobDurationMinutes },
        snapshot: { type: 'string', maxLength: config.validation.maxStrLen },
        feature: {
          type: 'string',
          enum: Object.keys(allowedFeatures),
          default: allowedFeatures.PYTHON_R,
        },
        imagename: { type: 'string', maxLength: config.validation.maxStrLen },
        cmd: { type: 'string', maxLength: config.validation.maxStrLen },
        // rshiny app
        app_gz: { type: 'string', maxLength: config.validation.maxStrLen },
        // ttyd
        port: { type: 'integer' },
        // Apache Guacamole
        max_session_length: { type: 'string', maxLength: config.validation.maxStrLen },
      },
    },
  },
  required: ['scope', 'jobLimit'],
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
  Provenance,
  jobIdAppIdSchema,
  DxIdInput,
  DescribeJobInput,
  ListJobsInput,
  PageJobs,
  WorkstationSyncFilesInput,
}
