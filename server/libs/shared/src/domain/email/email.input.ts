import type { JSONSchema7 } from 'json-schema'
import { emailTypeIds } from './email.config'

const sendEmailParamSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    emailId: { type: 'integer', enum: emailTypeIds },
  },
  required: ['emailId'],
  additionalProperties: false,
}

const sendEmailBodySchema: JSONSchema7 = {
  type: 'object',
  properties: {
    input: { type: 'object', additionalProperties: true },
  },
  required: ['input'],
  additionalProperties: false,
}

export { sendEmailParamSchema, sendEmailBodySchema }
