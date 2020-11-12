import type { JSONSchema7, JSONSchema7Definition } from 'json-schema'
import { config } from '../config'

// generic schemas

const idProp: JSONSchema7Definition = { type: 'integer', minimum: 1 }
const dxidProp: JSONSchema7Definition = {
  type: 'string',
  minLength: 1,
  maxLength: config.validation.maxIdStrLen,
}

const idInputSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    id: idProp,
  },
  required: ['id'],
}

const getDxidInputSchema: (paramName: string) => JSONSchema7 = (paramName = 'id') => ({
  type: 'object',
  properties: {
    [paramName]: dxidProp,
  },
  required: [paramName],
})

const userContextSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    id: idProp,
    accessToken: { type: 'string', minLength: 1, maxLength: config.validation.maxStrLen },
    dxuser: dxidProp,
  },
  required: ['id', 'accessToken', 'dxuser'],
}

const schemas = {
  userContextSchema,
  getDxidInputSchema,
  idInputSchema,
  idProp,
  dxidProp,
}

export { schemas }
