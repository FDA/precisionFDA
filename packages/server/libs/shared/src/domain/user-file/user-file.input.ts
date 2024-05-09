import { UidInput } from '@shared/types'
import type { JSONSchema7 } from 'json-schema'
import { config } from '../../config'
import { FILE_ORIGIN_TYPE, PARENT_TYPE } from './user-file.types'
import { EntityScope, SCOPE } from '../../types/common'

type SyncFoldersInput = {
  remoteFolderPaths: string[]
  projectDxid: string
  parentType: PARENT_TYPE
  parentId: number
  scope: string
}

export type FOLLOW_UP_ACTION =
  | 'UPDATE_DATA_PORTAL_RESOURCE_URL'
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

type SyncFilesInFolderInput = {
  folderId: number | null
  projectDxid: string
  scope: EntityScope
  parentId: number
  parentType: PARENT_TYPE
  entityType: FILE_ORIGIN_TYPE
  runAdd: boolean
  runRemove: boolean
}

type RenameFolderInput = {
  id: number
  newName: string
}

type NodesInput = {
  ids: number[]
  async: boolean
}

const nodesSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    ids: { type: 'array' },
    async: { type: 'boolean' },
  },
  required: ['ids'],
  additionalProperties: false,
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

const CLINodeSearchSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    arg: { type: 'string' },
    spaceId: { type: ['number', 'null'] },
    folderId: { type: ['number', 'null'] },
    type: { type: 'string' },
  },
  required: ['arg', 'type'],
  additionalProperties: false,
}

type CLINodeSearchInput = {
  arg: string
  type: string
  spaceId?: number
  folderId?: number
}

export {
  SyncFoldersInput,
  SyncFilesInFolderInput,
  RenameFolderInput,
  NodesInput,
  renameFolderSchema,
  IdsInput,
  nodesSchema,
  nodeQueryFilter,
  CLINodeSearchSchema,
  CLINodeSearchInput,
}
