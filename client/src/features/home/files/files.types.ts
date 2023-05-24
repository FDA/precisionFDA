import { ServerScope } from "../types"

export enum FilesListActions {
  'Track' = 'Track',
  'Open' = 'Open',
  'Download' = 'Download',
  'Edit info' = 'Edit info',
  'Make public' = 'Make public',
  'Delete' = 'Delete',
  'Organize' = 'Organize',
  'Copy to space' = 'Copy to space',
  'Attach to...' = 'Attach to...',
  'Attach License' = 'Attach License',
}

export enum FolderActions {
  'Add Folder' = 'Add Folder',
  'Add Files' = 'Add Files',
  'Copy Files' = 'Copy Files',
  'Choose Add Option' = 'Choose Add Option',
}

export type FileStatus = 'closed' | 'closing' | 'open' | 'removing'
export type FileLocation = 'Public' | 'Private'
export type FileType = 'UserFile' | 'Folder' | 'File'
export type FileOrigin = 'UserFile'

export type OriginType = 'User' | 'Job' | 'Comparison' | 'UserFile'
export interface FileLinks {
  'origin_object'?: {
    'origin_type'?: OriginType
    'origin_uid'?: string
  },
  'show'?: string,
  'user'?: string,
  'track'?: string,
  'download_list'?: string,
  'rename_folder'?: string,
  'rename'?: string,
  'attach_to'?: string,
  'add_file'?: string,
  'add_folder'?: string,
  'publish'?: string,
  'update'?: string,
  'feature'?: string,
  'organize'?: string,
  'show_license'?: string,
  'space'?: string,
  'license'?: string,
  'children'?: string,
  'copy'?: string,
  'remove'?: string,
  'download'?: string,
  'request_approval_license'?: string,
  'accept_license_action'?: string,
  'detach_license'?: string,
}

export interface IFile {
  'id': string,
  'name': string,
  'size': string,
  'type': FileType,
  'locked': boolean,
  'state': FileStatus,
  'location': FileLocation,
  'added_by': string,
  'created_at': string,
  'featured': boolean,
  'scope': ServerScope,
  'space_id': string | null,
  'origin': string | {
    text?: string
    fa?: string
    href?: string
  }
  'tags': string[],
  'uid': string,
  'file_size': string,
  'created_at_date_time': string,
  'description': string,
  'links': FileLinks,
  'file_license': {
    id: string
    title: string
    uid: string
  },
  'show_license_pending': boolean
}
