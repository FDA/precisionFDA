import type { JSONSchema7 } from 'json-schema'
import { config } from '../../config'
import { FILE_ORIGIN_TYPE, PARENT_TYPE } from './user-file.enum'

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

export { SyncFoldersInput, SyncFilesInFolderInput, RenameFolderInput, renameFolderSchema }
