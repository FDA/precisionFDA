import type { TreeProps } from 'rc-tree'
import type { BasicDataNode } from 'rc-tree/es/interface'
import type { DataNode } from 'rc-tree/lib/interface'
import type { FileOrg, FileUser } from '../apps/apps.types'
import type { ServerScope } from '../home/types'
import type { FileLicense } from '../assets/assets.types'

export interface NodePermissions {
  canDelete: boolean
  canMove: boolean
  canDownload: boolean
  canCopy: boolean
  canEdit: boolean
  canFeature: boolean
  canPublish: boolean
  canLock: boolean
  canUnlock: boolean
}

export type FileState = 'closed' | 'closing' | 'open' | 'removing'
export type FileLocation = 'Public' | 'Private' | string
export type FileType = 'UserFile' | 'Folder' | 'File' | 'Asset'
export type FileScope = 'public' | 'private' | string
export type FileUid = `file-${string}-${number}`

export type OriginType = 'User' | 'Job' | 'Comparison' | 'UserFile' | 'Folder'

export interface FileOrigin {
  text?: string
  fa?: string
  href?: string
}

export interface OriginObject {
  originType?: OriginType | null
  originUid?: string | null
}

export interface IFile {
  id: number
  name: string
  size?: string
  type: FileType
  stiType?: FileType
  locked: boolean
  resource: boolean
  locking?: boolean
  state: FileState | null
  location: FileLocation
  addedBy: string
  addedByDxuser?: string
  createdAt: string
  featured: boolean
  scope: ServerScope
  spaceId: string | null
  origin: FileOrigin | string | null
  originObject?: OriginObject
  tags: string[]
  properties: {
    [key: string]: string
  }
  uid: string
  fileSize: string
  createdAtDateTime: string
  description: string | null
  fileLicense?: FileLicense | null
  show_license_pending?: boolean
  folderPath?: { id: number; name: string }[]
  private?: boolean
  public?: boolean
  user?: FileUser
  org?: FileOrg
  permissions?: NodePermissions
  requestApprovalLicenseLink?: string
  acceptLicenseActionLink?: string
  downloadLink?: string
}

export interface IFolderPath {
  id: number | null
  name: string
}

export interface IFolder {
  path: IFolderPath[]
  filePath?: string
  state: null
  id: number
  name: string
  size?: string
  type: FileType
  stiType: FileType
  locked: boolean
  locking?: boolean
  location: FileLocation
  origin: string | null
  addedBy: string
  addedByDxuser?: string
  createdAt: string
  featured: boolean
  scope: ServerScope
  spaceId: string | null
  originObject?: OriginObject
  tags: string[]
  properties: {
    [key: string]: string
  }
  createdAtDateTime: string
  private?: boolean
  public?: boolean
  user?: FileUser
  org?: FileOrg
  permissions?: NodePermissions
}

export interface ISelectedNode {
  id: number
  name: string
  sourceScope: ServerScope
  sourceScopePath: string
  type: 'Folder' | 'UserFile'
  sourceFolderId: number
}

export interface ISelectedFile extends ISelectedNode {
  type: 'UserFile'
  state: FileState
  uid: string
  targetScope?: ServerScope
  targetScopePath?: string
  targetUid?: string
  isCopied?: boolean
}

export interface ISelectedFolder extends ISelectedNode {
  type: 'Folder'
  isCopied?: boolean
  targetScope?: ServerScope
  children: ISelectedFile[]
}

export type SelectedNode = ISelectedFile | ISelectedFolder

interface IExistingFile {
  uid: string
  targetScopePath: string
}
export interface IExistingFileSet {
  [key: string]: IExistingFile
}

export interface User {
  dxuser: string
  full_name: string
}

export interface Org {
  handle: string
  name: string
}

export interface CustomDataNode extends DataNode {
  uid?: string
}

/**
 * Data structure of FileTree.onSelect
 */
export interface SelectionDetails {
  selectedNodes: DataNode[]
}

// this is the type of the "node". The BasicDataNode is what the library requires and the two properties before it are the ones we are using - parent (added by you) and title (already existed, but the "any" types hidden the fact, that it does not exist on the default node type).
export type FileTreeNode = { parent: FileTreeNode; title: string; path: string } & BasicDataNode
// Retrieves the second parameter of the onSelect method from the TreeProps interface with the node type generic. The Required type is needed, because the onSelect property on the TreeProps is defined as optional, but the Parameters type requires simply a function (not function | undefined).
export type TreeOnSelectInfo = Parameters<Required<TreeProps<FileTreeNode>>['onSelect']>[1]
