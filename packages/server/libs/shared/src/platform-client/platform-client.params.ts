import {
  AppAccess,
  AppInputSpecItem,
  AppSpecItem,
  SystemRequirements,
} from '@shared/domain/app/app.input'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { AnyObject } from '../types'

export type Starting = {
  project: string
  id: string
}

export interface IPaginatedParams {
  // the API uses it as a starting point when doing pagination
  starting?: Starting
}

export type JobDescribeParams = { jobDxId: DxId<'job'> }
export type JobTerminateParams = { jobId: string }

export type PackageMapping = {
  name: string
  packageManager?: string
  version?: string
  stages?: string[]
}

type RunSpec = {
  code: string
  interpreter: string
  systemRequirements: {
    [key: '*' | string]: SystemRequirements
  }
  distribution: string
  release: string
  execDepends: PackageMapping[]
  version?: string
}

export type AppletCreateParams = {
  project?: string
  name?: string
  title?: string
  inputSpec: AppInputSpecItem[]
  outputSpec: AppSpecItem[]
  runSpec: RunSpec
  dxapi: string
  access?: AppAccess
}

export type AppUpdateParams = {
  billTo?: string
}

export type AppCreateParams = {
  applet: string // deprecated field!
  name?: string
  title?: string
  summary?: string
  description?: string
  version: string
  resources?: string[] // deprecated field!
  details?: AnyObject
  openSource?: boolean
  billTo?: string
  access?: AppAccess
  regionalOptions?: AnyObject
}

export type AppAddAuthorizedUsersParams = {
  appId: string
  authorizedUsers: string[]
}

export type AppAddDevelopersParams = {
  appId: string
  developers: string[] // user/org dxids
}

export type AppPublishParams = {
  appId: string
  makeDefault?: boolean
}

export type JobFindParams = {
  id?: string[] // job dxid
  project?: string // ID of the project context, or the project in which the job was launched

  includeSubjobs?: boolean
  describe: boolean
  name?: string
  state?: string[]
}

export type JobCreateParams = {
  appId: string
  project: string
  name?: string
  costLimit: number
  input: AnyObject
  systemRequirements?: AnyObject
  timeoutPolicyByExecutable?: AnyObject
  snapshot?: {
    $dnanexus_link: {
      project?: string
      id: string
    }
  }
}

export type FileRemoveParams = {
  projectId: string
  ids: string[]
}

export type ListFilesParams = IPaginatedParams & {
  project: string
  folder?: string
  includeDescProps?: boolean
}

export type FileCreateParams = {
  name: string
  description: string
  project: string
}

export type FileCloseParams = {
  fileDxid: string
}

export type FileDescribeParams = {
  fileDxid: string
  projectDxid: string
}

export type FileDownloadLinkParams = {
  fileDxid: string
  filename: string
  project: string
  duration: number // in seconds
  preauthenticated?: boolean
}

export type FileGetUploadUrlParams = {
  dxid: string
  size: number
  md5: string
  index: number
}

export type FileStatesParams = {
  fileDxids: string[]
  projectDxid: string
}

export type DescribeFoldersParams = {
  projectId: string
}

export type RenameFolderParams = {
  folderPath: string
  newName: string
  projectId: string
}

export type RemoveFolderParams = {
  folderPath: string
  projectId: string
}

export type CreateFolderParams = {
  folderPath: string
  projectId: string
}

export type OrgFindMembersParams = {
  orgDxid: string
  level?: string
  id?: string | string[]
  describe?: boolean | { [key: string]: boolean }
  starting?: { [key: string]: boolean }
  limit?: number
}

export type OrgMemberAccess = {
  level: 'ADMIN' | 'MEMBER'
  allowBillableActivities?: boolean
  appAccess?: boolean
  projectAccess?: 'ADMINISTER' | 'CONTRIBUTE' | 'UPLOAD' | 'VIEW' | 'NONE'
}

export type OrgSetMemberAccessParams = {
  orgDxId: DxId<'org'>
  data: {
    [userDxId: DxId<'user'>]: OrgMemberAccess
  }
}

export type UserInviteToOrgParams = {
  orgDxId: string
  data: {
    invitee: string
    level: 'MEMBER' | 'ADMIN'
    projectAccess?: 'ADMINISTER' | 'CONTRIBUTE' | 'UPLOAD' | 'VIEW' | 'NONE'
    allowBillableActivities?: boolean
    appAccess?: boolean
    suppressEmailNotification?: boolean
  }
}
export type UserRemoveFromOrgParams = {
  orgDxId: string
  data: {
    user: string
    revokeProjectPermissions?: boolean
    revokeAppsPermissions?: boolean
  }
}

export type MoveFilesParams = {
  destinationFolderPath: string
  fileIds: string[]
  projectId: string
}

export type DbClusterCreateParams = {
  name: string
  project: string
  engine: string
  engineVersion: string
  dxInstanceClass: string
  adminPassword: string
}

export type DbClusterDescribeParams = {
  dxid: string
  project?: string
}

export type DbClusterActionParams = { dxid: string }

export type ObjectsParams = {
  objects: string[]
}

export type DescribeDataObjectsParams = {
  objects: Array<string | Record<string, string>>
}

export type OrgDescribeParams = {
  dxid: string
  defaultFields?: boolean
  fields?: unknown
}

export type UserDescribeParams = {
  dxid: string
  defaultFields?: boolean
  fields?: unknown
}

export type UserResetMfaParams = {
  dxid: string
  data: {
    user_id: string
    org_id: string
  }
}

export type UserUnlockParams = {
  dxid: string
  data: {
    user_id: string
    org_id: string
  }
}

export type UserCreateData = {
  username: string
  email: string
  first: string
  last: string
  billTo: DxId<'org'>
  pfdasso?: boolean
}

export type AppDescribeParams = {
  dxid: string
}

export type WorkflowDescribeParams = {
  dxid: string
}

export type CloneObjectsParams = {
  sourceProject: string
  destinationProject: string
  objects: string[]
}

export type ProjectLeaveParams = {
  projectDxid: string
}
