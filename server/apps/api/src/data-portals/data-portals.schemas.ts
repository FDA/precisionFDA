import { DATA_PORTAL_STATUS } from '@shared/domain/data-portal/data-portal.enum'
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

const dataPortalCreate: JSONSchema7 = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    default: { type: 'boolean', default: false },
    hostLeadDxUser: { type: 'string' },
    guestLeadDxUser: { type: 'string' },
    spaceId: { type: 'string' },
    sortOrder: { type: 'number' },
    status: { type: 'string', enum: [DATA_PORTAL_STATUS.OPEN, DATA_PORTAL_STATUS.CLOSED] },
  },
  required: ['name', 'hostLeadDxUser', 'guestLeadDxUser',
    'spaceId', 'sortOrder', 'status'],
  additionalProperties: false,
}

const dataPortalUpdate: JSONSchema7 = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    description: { type: 'string' },
    default: { type: 'boolean', default: false },
    hostLeadDxUser: { type: 'string' },
    guestLeadDxUser: { type: 'string' },
    content: { type: 'string' },
    editorState: { type: 'string' },
    cardImageUid: { type: 'string' },
    sortOrder: { type: 'number' },
    status: { type: 'string', enum: [DATA_PORTAL_STATUS.OPEN, DATA_PORTAL_STATUS.CLOSED] },
  },
  required: ['id'],
  additionalProperties: false,
}

export { file, dataPortalCreate, dataPortalUpdate }
