import { PARENT_TYPE } from './user-file.enum'

type SyncFoldersInput = {
  remoteFolderPaths: string[]
  projectDxid: string
  parentType: PARENT_TYPE
  parentId: number
  scope: string
}

export { SyncFoldersInput }
