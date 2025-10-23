import { Uid } from '@shared/domain/entity/domain/uid'
import { EntityScope, SCOPE } from '../../types/common'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { Folder } from '@shared/domain/user-file/folder.entity'

// File state from the platform
enum FILE_STATE_DX {
  ABANDONED = 'abandoned', // See PFDA-685
  CLOSING = 'closing',
  CLOSED = 'closed',
  OPEN = 'open',
}

enum FILE_STATE_PFDA {
  // pFDA internal state, used for files that are being copied by a worker.
  COPYING = 'copying',
  REMOVING = 'removing',
}

type FILE_STATE = FILE_STATE_DX | FILE_STATE_PFDA
type FOLDER_STATE = FILE_STATE_PFDA.REMOVING | null

enum FILE_STI_TYPE {
  USERFILE = 'UserFile',
  ASSET = 'Asset',
  FOLDER = 'Folder',
}

enum PARENT_TYPE {
  USER = 'User',
  JOB = 'Job',
  ASSET = 'Asset',
  COMPARISON = 'Comparison',
  NODE = 'Node',
}

interface BulkDownloadFile {
  url: string
  path: string
}

interface BulkDownloadFiles {
  files: BulkDownloadFile[]
  scope: string
}

export type FileOrAsset = UserFile | Asset
export type FileOrAssetOrFolder = UserFile | Asset | Folder

interface NodeResponse {
  id: number
  name: string
  type: 'Folder' | 'UserFile' | 'Asset'
  uid?: string
  dxid?: string
  state: string | null
  file_size: number | undefined
  created_at: Date
  locked: boolean
  tags?: string[]
  parent_folder_id: number | null
}

interface ResolvePath {
  path: string
  scope: SCOPE
  nodes: NodeResponse[]
}

interface ExistingFile {
  uid: Uid<'file'>
  targetScopePath: string
}

interface ExistingFileSet {
  [key: Uid<'file'>]: ExistingFile
}

interface ISelectedNode {
  id: number
  name: string
  sourceScope: EntityScope
  sourceScopePath: string
  type: FILE_STI_TYPE.FOLDER | FILE_STI_TYPE.USERFILE
  sourceFolderId: number
}

interface SelectedFile extends ISelectedNode {
  type: FILE_STI_TYPE.USERFILE
  state: FILE_STATE
  uid: Uid<'file'>
}

interface SelectedFolder extends ISelectedNode {
  type: FILE_STI_TYPE.FOLDER
  children: SelectedFile[]
}

type SelectedNode = SelectedFile | SelectedFolder

export {
  BulkDownloadFile,
  BulkDownloadFiles,
  ExistingFileSet,
  FILE_STATE,
  FILE_STATE_DX,
  FILE_STATE_PFDA,
  FILE_STI_TYPE,
  FOLDER_STATE,
  NodeResponse,
  PARENT_TYPE,
  ResolvePath,
  SelectedFile,
  SelectedFolder,
  SelectedNode,
}
