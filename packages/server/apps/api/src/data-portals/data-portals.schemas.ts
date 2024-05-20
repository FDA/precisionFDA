import { JSONSchema7 } from 'json-schema'

const file: JSONSchema7 = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    description: { type: 'string' },
  },
  required: ['name'],
  additionalProperties: false,
}

export { file }
