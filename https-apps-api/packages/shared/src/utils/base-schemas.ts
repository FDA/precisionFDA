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
  additionalProperties: false,
}

const uidProp: JSONSchema7Definition = {
  type: 'string',
  minLength: 1,
  maxLength: config.validation.maxIdStrLen,
}
const uidInputSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    uid: uidProp,
  },
  required: ['uid'],
  additionalProperties: false,
}

const getDxidsInputSchema: (paramName: string) => JSONSchema7 = (paramName = 'ids') => ({
  type: 'object',
  properties: {
    [paramName]: {
      type: 'array',
      uniqueItems: true,
      items: dxidProp,
      minItems: 1,
    }
  },
  required: [paramName],
  additionalProperties: false,
})

const getDxidInputSchema: (paramName: string) => JSONSchema7 = (paramName = 'id') => ({
  type: 'object',
  properties: {
    [paramName]: dxidProp,
  },
  required: [paramName],
  additionalProperties: false,
})

const userContextSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    id: idProp,
    accessToken: { type: 'string', minLength: 1, maxLength: config.validation.maxStrLen },
    dxuser: dxidProp,
  },
  required: ['id', 'accessToken', 'dxuser'],
  additionalProperties: true,
}

const paginationSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1 },
    limit: { type: 'integer', minimum: 2 },
  },
  required: [],
  additionalProperties: true,
}

const schemas = {
  userContextSchema,
  getDxidInputSchema,
  getDxidsInputSchema,
  idInputSchema,
  idProp,
  dxidProp,
  paginationSchema,
  uidInputSchema,
}

export { schemas }
