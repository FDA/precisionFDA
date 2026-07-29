import type { TreeProps } from 'rc-tree'
import type { BasicDataNode } from 'rc-tree/es/interface'
import type { DataNode } from 'rc-tree/lib/interface'
import type { FileLicense } from '../assets/assets.types'
import type { ServerScope } from '../home/types'

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

export type OriginType = 'User' | 'Job' | 'Comparison' | 'UserFile' | 'Folder' | 'Node'

export interface FileOrigin {
  text?: string
  fa?: string
  href?: string
}

export interface OriginObject {
  originType?: OriginType | null
  originUid?: string | null
}

export interface IFolderPath {
  id: number | null
  name: string
}

export interface INode {
  id: number
  name: string
  scope: ServerScope
  state: FileState | null
  spaceId: number | null
  featured: boolean
  locked: boolean
  createdAt: string
  createdAtDateTime: string
  path?: string
  folderId: number | null
  addedBy: string
  addedByDxuser?: string
  tags: string[]
  properties: {
    [key: string]: string
  }
  location: FileLocation
  stiType: FileType
  permissions?: NodePermissions
}

export interface IFolder extends INode {
  stiType: 'Folder'
}

export interface IFile extends INode {
  uid: string
  size?: string
  stiType: 'UserFile'
  resource: boolean
  locking?: boolean
  origin: FileOrigin | string | null
  originObject?: OriginObject
  fileSize: string
  description: string | null
  show_license_pending?: boolean
  fileLicense?: FileLicense | null
  folderPath?: { id: number; name: string }[]
  requestApprovalLicenseLink?: string
  acceptLicenseActionLink?: string
  downloadLink?: string
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
