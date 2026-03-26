import { Uid } from '@shared/domain/entity/domain/uid'
import { FILE_STATE, FILE_STI_TYPE, FOLDER_STATE } from '@shared/domain/user-file/user-file.types'
import { EntityScope } from '@shared/types/common'

type BillableOrg = {
  org: string
  errors: string[]
}

export type ProjectInfo = {
  status: string
  projectDescribe: unknown
}

export type PrivateProject = {
  [key: string]: ProjectInfo | string
}

export type SpaceInfo = {
  id: number
  active: boolean
  spaceType: string
  spaceState: string
  spaceId: number
  hostProject: string
  guestProject: string
  hostDxOrg: string
  guestDxtOrg: string
  side: string
  errors: string[]
}

export type FileOrAssetInfo = {
  id: number
  uid: Uid<'file'>
  dxuser: string
  state: string
  entityType: 'file' | 'asset'
  elapsedMillisSinceCreation: number
}

export type NodeInfo = {
  id: number
  name: string
  parentFolderId?: number
  scopedParentFolderId?: number
  scope: EntityScope
  state: FILE_STATE | FOLDER_STATE
  stiType: FILE_STI_TYPE
  errors: string[]
}

export type UserDataConsistencyReportOutput = {
  user?: {
    id: number
    dxuser: string
    dxid?: string
    email?: string
  }
  billableOrg?: BillableOrg
  billableOrgErrorsCount?: number
  privateProjectsCount?: number
  privateProjects?: PrivateProject
  filesAndFoldersStatus?: NodeInfo[]
  filesAndFoldersErrorsCount?: number
  unclosedFilesCount?: number
  unclosedFiles?: FileOrAssetInfo[]
  spaces?: SpaceInfo[]
  spacesWithErrorsCount?: number
}

export type InconsistentFix = [string, unknown[]]
