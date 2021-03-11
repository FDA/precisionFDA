import type { JSONSchema7 } from 'json-schema'
import { schemas } from '../../utils'
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
    receiverUserIds: { type: 'array', items: schemas.idProp, minItems: 1, uniqueItems: true },
    input: { type: 'object', additionalProperties: true },
  },
  required: ['receiverUserIds', 'input'],
  additionalProperties: false,
}

export { sendEmailParamSchema, sendEmailBodySchema }
