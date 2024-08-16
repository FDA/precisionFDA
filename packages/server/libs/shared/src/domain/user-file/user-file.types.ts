import { Collection, Ref } from '@mikro-orm/core'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Uid } from '@shared/domain/entity/domain/uid'
import { NodeProperty } from '@shared/domain/property/node-property.entity'
import { Tagging } from '@shared/domain/tagging/tagging.entity'
import { EntityScope, SCOPE } from '../../types/common'
import { User } from '../user/user.entity'

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

enum FILE_ORIGIN_TYPE {
  REGULAR = 0,
  HTTPS = 1,
}

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

// IFileOrAsset is for methods that operate on UserFiles and Assets
// but not all nodes (not Folders)
interface IFileOrAsset {
  id: number
  dxid: DxId<'file'>
  uid: Uid<'file'>
  project: string
  name: string
  scope: EntityScope
  state: string
  fileSize?: number
  user: Ref<User>
  createdAt: Date
  updatedAt: Date
  taggings: Collection<Tagging>
  properties: Collection<NodeProperty>
  isFile: boolean
  isAsset: boolean
  isCreatedByChallengeBot: () => boolean
}

interface BulkDownloadFile {
  url: string
  path: string
}

interface BulkDownloadFiles {
  files: BulkDownloadFile[]
  scope: string
}

// ITrackable represents an object whose provenance can be tracked
// This is applicable to UserFile, Folder and Assets
interface ITrackable {
  parentId: number
  parentType: PARENT_TYPE
}

interface NodeResponse {
  id: number
  name: string
  type: 'Folder' | 'UserFile'
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
  FILE_ORIGIN_TYPE,
  FILE_STATE,
  FILE_STATE_DX,
  FILE_STATE_PFDA,
  FILE_STI_TYPE,
  FOLDER_STATE,
  IFileOrAsset,
  ITrackable,
  NodeResponse,
  PARENT_TYPE,
  ResolvePath,
  SelectedFile,
  SelectedFolder,
  SelectedNode,
}
