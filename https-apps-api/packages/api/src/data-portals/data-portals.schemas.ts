import { JSONSchema7 } from 'json-schema'
import { dataPortal } from '@pfda/https-apps-shared'

const file: JSONSchema7 = {
  type: 'object',
  properties: {
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
    hostLeadDxUser: { type: 'string' },
    guestLeadDxUser: { type: 'string' },
    spaceId: { type: 'string' },
    sortOrder: { type: 'number' },
    status: { type: 'string', enum: [dataPortal.STATUS.OPEN, dataPortal.STATUS.CLOSED] },
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
    hostLeadDxUser: { type: 'string' },
    guestLeadDxUser: { type: 'string' },
    content: { type: 'string' },
    editorState: { type: 'string' },
    cardImageUid: { type: 'string' },
    sortOrder: { type: 'number' },
    status: { type: 'string', enum: [dataPortal.STATUS.OPEN, dataPortal.STATUS.CLOSED] },
  },
  required: ['id'],
  additionalProperties: false,
}

export { file, dataPortalCreate, dataPortalUpdate }
