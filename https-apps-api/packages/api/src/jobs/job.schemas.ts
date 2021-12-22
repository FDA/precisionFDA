import { JSONSchema7 } from "json-schema"


export const jobSyncFilesQuerySchema: JSONSchema7 = {
  type: 'object',
  properties: {
    force: { type: 'boolean', default: false },
  },
  required: [],
  additionalProperties: true,
}
