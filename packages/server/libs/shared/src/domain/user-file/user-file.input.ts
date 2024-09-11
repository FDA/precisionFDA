import { UidInput } from '@shared/types'
import type { JSONSchema7 } from 'json-schema'
import { config } from '../../config'

export type FOLLOW_UP_ACTION =
  | 'UPDATE_DATA_PORTAL_IMAGE_URL'
  | 'UPDATE_CHALLENGE_IMAGE_URL'
  | 'UPDATE_CHALLENGE_RESOURCE_URL'
  | 'COMPLETE_SPACE_REPORT'

export type FileUidInput = {
  fileUid: string
}

export type FollowUpInput = {
  followUpAction: FOLLOW_UP_ACTION
}

export type SyncFileJobInput = FileUidInput &
  FollowUpInput & {
    isChallengeBotFile: boolean
    followUpAction?: FOLLOW_UP_ACTION
  }

export type UidAndFollowUpInput = UidInput & FollowUpInput

type RenameFolderInput = {
  id: number
  newName: string
}

const renameFolderSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    newName: { type: 'string', maxLength: config.validation.maxStrLen },
  },
  required: ['newName'],
  additionalProperties: false,
}

type IdsInput = {
  ids: number[]
}

type nodeQueryFilter = {
  locked?: boolean
}

export {
  IdsInput,
  RenameFolderInput,
  nodeQueryFilter,
  renameFolderSchema,
}
