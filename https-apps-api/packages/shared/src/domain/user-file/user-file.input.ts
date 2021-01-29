import { FILE_TYPE, PARENT_TYPE } from './user-file.enum'

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
  entityType: FILE_TYPE
  runAdd: boolean
  runRemove: boolean
}

export { SyncFoldersInput, SyncFilesInFolderInput }
