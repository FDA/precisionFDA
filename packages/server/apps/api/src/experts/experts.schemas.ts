import { schemas } from '@shared/utils/base-schemas'
import { JSONSchema7 } from 'json-schema'

export const expertListQuerySchema: JSONSchema7 = {
  type: 'object',
  properties: {
    ...schemas.paginationSchema.properties,
    year: {
      type: 'integer',
      minimum: 2017,
    },
  },
  required: [],
  // Note: has to be enabled because of auth part of query string
  additionalProperties: true,
}
