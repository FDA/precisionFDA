import type { JSONSchema7 } from 'json-schema'

export const deleteSpaceReportQuerySchema: JSONSchema7 = {
  type: 'object',
  properties: {
    id: {
      type: ['number', 'array'],
      items: {
        type: 'number',
      },
    },
  },
  required: ['id'],
  additionalProperties: true,
}
