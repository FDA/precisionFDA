import type { JSONSchema7 } from 'json-schema'
import { config } from '../../config'
import { SCOPE } from '../../types/common'
import { DxId } from '../entity/domain/dxid'
import { Job } from './job.entity'
import { allowedFeatures, allowedInstanceTypes } from './job.enum'

type DxIdInput = {
  dxid: string
}

type RunAppInput = {
  scope: SCOPE
  name?: string
  instanceType: string
  jobLimit: number
  input?: {
    snapshot: string
    feature?: string
    duration?: number
    cmd?: string
    imagename?: string
    port?: number // ttyd
  }
  appDxId: DxId<'app'>
  output_folder_path?: string
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
      //TODO: at the moment only HTTPS apps are run by nodejs. Once we support the regular apps as well, we will have to refactor input validation into something more dynamic and readable
      properties: {
        // JupyterLab app
        duration: {
          type: 'integer',
          minimum: 30,
          maximum: config.validation.maxJobDurationMinutes,
        },
        feature: {
          type: 'string',
          enum: Object.keys(allowedFeatures),
          default: allowedFeatures.PYTHON_R,
        },
        imagename: { type: 'string', maxLength: config.validation.maxStrLen },
        cmd: { type: 'string', maxLength: config.validation.maxStrLen },
        in: { type: 'array', default: [] },

        // rshiny app
        app_gz: { type: 'string', maxLength: config.validation.maxStrLen },

        // Apache Guacamole
        max_session_length: { type: 'string', maxLength: config.validation.maxStrLen },

        // ttyd
        path_to_executable: { type: 'string' },
        port: { type: 'integer' },

        // common
        snapshot: { type: 'string', maxLength: config.validation.maxStrLen },
      },
    },
    output_folder_path: { type: 'string' },
  },
  required: ['scope', 'jobLimit'],
  additionalProperties: false,
}

export {
  DescribeJobInput,
  DxIdInput,
  ListJobsInput,
  PageJobs,
  Provenance,
  RunAppInput,
  runAppSchema,
}
