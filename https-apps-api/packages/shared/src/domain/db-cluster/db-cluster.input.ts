import type { JSONSchema7 } from 'json-schema'
import { ENGINES, allowedInstanceTypes, allowedEngineVersions } from './db-cluster.enum'
import { config } from '../../config'
import { schemas } from '../../utils'
import { STATIC_SCOPE } from '../../enums'

type CreateDbClusterInput = {
  name: string
  project: string
  engine: string
  engineVersion: string
  dxInstanceClass: string
  adminPassword: string
  scope: string
  description?: string
}

const createDbClusterSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    name: { type: 'string', maxLength: config.validation.maxStrLen },
    project: schemas.dxidProp,
    engine: { type: 'string', enum: Object.values(ENGINES) },
    engineVersion: { type: 'string', enum: allowedEngineVersions },
    dxInstanceClass: { type: 'string', enum: allowedInstanceTypes },
    adminPassword: { type: 'string', minLength: 8, maxLength: config.validation.maxStrLen },
    scope: { type: 'string', enum: Object.values(STATIC_SCOPE) },
    description: { type: 'string' },
  },
  required: ['name', 'project', 'engine', 'engineVersion',
             'dxInstanceClass', 'adminPassword', 'scope'],
  additionalProperties: false,
}

export {
  createDbClusterSchema,
  CreateDbClusterInput,
}
