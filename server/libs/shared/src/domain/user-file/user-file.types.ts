import { Collection, Ref } from '@mikro-orm/core'
import { Comparison } from '@shared/domain/comparison/comparison.entity'
import { Job } from '@shared/domain/job/job.entity'
import { NodeProperty } from '@shared/domain/property/node-property.entity'
import { Tagging } from '@shared/domain/tagging/tagging.entity'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { User } from '../user/user.entity'
import { SCOPE } from '../../types/common'
import { Folder } from './folder.entity'
import { UserFile } from './user-file.entity'

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

type ParentEntity = User | Job | Asset | Comparison

// IFileOrAsset is for methods that operate on UserFiles and Assets
// but not all nodes (not Folders)
interface IFileOrAsset {
  id: number
  dxid: string
  uid: string
  project: string
  name: string
  scope: SCOPE
  state: string
  fileSize?: number
  user: Ref<User>
  entityType: FILE_ORIGIN_TYPE
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
  path: string,
  scope: SCOPE,
  nodes: NodeResponse[],
}

export {
  FILE_STATE,
  FOLDER_STATE,
  FILE_STATE_PFDA,
  FILE_STATE_DX,
  FILE_ORIGIN_TYPE,
  PARENT_TYPE,
  ParentEntity,
  FILE_STI_TYPE,
  IFileOrAsset,
  ITrackable,
  BulkDownloadFile,
  BulkDownloadFiles,
  NodeResponse,
  ResolvePath,
}
