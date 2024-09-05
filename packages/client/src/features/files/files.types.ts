import { TreeProps } from 'rc-tree'
import { BasicDataNode } from 'rc-tree/es/interface'
import { DataNode } from 'rc-tree/lib/interface'
import { FileOrg, FileUser } from '../apps/apps.types'
import { ServerScope } from '../home/types'

export enum FolderActions {
  'Add Folder' = 'Add Folder',
  'Add Files' = 'Add Files',
  'Copy Files' = 'Copy Files',
  'Choose Add Option' = 'Choose Add Option',
}

export type FileState = 'closed' | 'closing' | 'open' | 'removing'
export type FileLocation = 'Public' | 'Private' | string
export type FileType = 'UserFile' | 'Folder' | 'File'
export type FileScope = 'public' | 'private' | string
export type FileUid = `file-${string}-${number}`

export type OriginType = 'User' | 'Job' | 'Comparison' | 'UserFile' | 'Folder'
export interface FileLinks {
  origin_object?: {
    origin_type?: OriginType
    origin_uid?: string | null
  }
  show?: string
  user?: string
  track?: string
  download_list?: string
  rename_folder?: string
  rename?: string
  attach_to?: string
  add_file?: string
  add_folder?: string
  publish?: string
  update?: string
  feature?: string
  organize?: string
  show_license?: string
  space?: string
  license?: string
  children?: string
  copy?: string
  remove?: string
  download?: string
  request_approval_license?: string
  accept_license_action?: string
  detach_license?: string
}

export interface IFile {
  id: number
  name: string
  size?: string
  type: FileType
  locked: boolean
  resource: boolean
  locking?: boolean
  state: FileState | null
  location: FileLocation
  added_by: string
  created_at: string
  featured: boolean
  scope: ServerScope
  space_id: string | null
  origin: string | {
        text?: string
        fa?: string
        href?: string
      }
  tags: string[]
  properties: {
    [key: string]: string
  }
  uid: string
  file_size: string
  created_at_date_time: string
  description: string | null
  /** @deprecated create links from client side */
  links: FileLinks
  file_license:
    | {
        id: string
        title: string
        uid: string
      }
    | Record<string, never>
  show_license_pending: boolean
  private?: boolean
  public?: boolean
  user?: FileUser
  org?: FileOrg
  path: IFile[]
}

export interface IFolderPath {
  id: number | null
  name: string
}

export interface IFolder {
  path: IFolderPath[]
  file_path?: string
  state: null
  id: number
  name: string
  size?: string
  type: FileType
  locked: boolean
  locking?: boolean
  location: FileLocation
  origin: string | null
  added_by: string
  created_at: string
  featured: boolean
  scope: ServerScope
  space_id: string | null
  tags: string[]
  properties: {
    [key: string]: string
  }
  created_at_date_time: string
  /** @deprecated create links from client side */
  links: FileLinks
  private?: boolean
  public?: boolean
  user?: FileUser
  org?: FileOrg
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
