import type { JSONSchema7 } from 'json-schema'
import { config } from '../../config'

const filesSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    ids: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
  },
  required: ['ids'],
}

type FilesInput = {
  ids: number[]
}

export { filesSchema, FilesInput }
