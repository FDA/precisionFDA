import { JSONSchema7 } from "json-schema"
import { utils } from '@pfda/https-apps-shared'

export const jobListQuerySchema: JSONSchema7 = {
  type: 'object',
  properties: {
    scope: { type: 'string', default: false },
    spaceId: { type: 'string', default: false },
    ...utils.schemas.paginationSchema.properties,
  },
  required: [],
  additionalProperties: true,
}

export const jobSyncFilesQuerySchema: JSONSchema7 = {
  type: 'object',
  properties: {
    force: { type: 'boolean', default: false },
  },
  required: [],
  additionalProperties: true,
}
