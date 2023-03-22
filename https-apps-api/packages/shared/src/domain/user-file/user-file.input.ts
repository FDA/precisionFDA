import type { JSONSchema7 } from 'json-schema'
import { config } from '../../config'
import { FILE_ORIGIN_TYPE, PARENT_TYPE } from './user-file.types'

type SyncFoldersInput = {
  remoteFolderPaths: string[]
  projectDxid: string
  parentType: PARENT_TYPE
  parentId: number
  scope: string
}

type SyncFilesInFolderInput = {
  folderId: number | null
  projectDxid: string
  scope: string
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

const renameFolderSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    newName: { type: 'string', maxLength: config.validation.maxStrLen },
  },
  required: ['newName'],
  additionalProperties: false,
}
type uidListInput = {
  ids: number[]
}

type nodeQueryFilter = {
  locked?: boolean
}

const uidListSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    ids: { type: 'array' },
  },
  required: ['ids'],
  additionalProperties: false,
}

const CLINodeSearchSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    arg: { type: 'string' },
    spaceId: { type: ['number' , 'null']},
    folderId: { type: ['number' , 'null']},
    type: {type: 'string' }

  },
  required: ['arg', 'type'],
  additionalProperties: false,
}

type CLINodeSearchInput = {
  arg: string,
  type: string,
  spaceId?: number,
  folderId?: number
}

export { SyncFoldersInput, SyncFilesInFolderInput, RenameFolderInput, renameFolderSchema, uidListSchema, uidListInput, nodeQueryFilter, CLINodeSearchSchema, CLINodeSearchInput }
