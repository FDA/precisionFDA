import { JSONSchema7 } from 'json-schema'
import { utils } from '@pfda/https-apps-shared'

export const expertListQuerySchema: JSONSchema7 = {
  type: 'object',
  properties: {
    ...utils.schemas.paginationSchema.properties,
    year: {
      type: 'integer',
      minimum: 2017,
    },
  },
  required: [],
  // Note: has to be enabled because of auth part of query string
  additionalProperties: true,
}
