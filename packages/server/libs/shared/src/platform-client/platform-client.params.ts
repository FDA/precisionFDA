import { PlatformSpec } from '../domain/app/app.input'
import { AnyObject } from '../types'

type Starting = {
  project: string
  id: string
}

interface IPaginatedParams {
  // the API uses it as a starting point when doing pagination
  starting?: Starting
}

type JobDescribeParams = { jobId: string }
type JobTerminateParams = { jobId: string }

type PackageMapping = {
  name: string
  packageManager?: string
  version?: string
  stages?: string[]
}

type RunSpec = {
  code: string
  interpreter: string
  systemRequirements: any
  distribution: string
  release: string
  execDepends: PackageMapping[]
  version?: string
}

type AppletCreateParams = {
  project?: string
  name?: string
  title?: string
  inputSpec: PlatformSpec[]
  outputSpec: PlatformSpec[]
  runSpec: RunSpec
  dxapi: string
  access: any
}

type AppCreateParams = {
  applet: string // deprecated field!
  name?: string
  title?: string
  summary?: string
  description?: string
  version: string
  resources?: string[] // deprecated field!
  details?: any
  openSource?: boolean
  billTo?: string
  access?: any
}

type AppAddAuthorizedUsersParams = {
  appId: string
  authorizedUsers: string[]
}

type AppPublishParams = {
  appId: string
  makeDefault?: boolean
}

type JobFindParams = {
  id: string[] // job dxid
  project?: string // ID of the project context, or the project in which the job was launched

  includeSubjobs?: boolean
  describe: boolean
}

type JobCreateParams = {
  appId: string
  project: string
  name?: string
  costLimit: number
  input: AnyObject
  systemRequirements: AnyObject
  timeoutPolicyByExecutable: AnyObject
  snapshot?: {
    $dnanexus_link: {
      project?: string
      id: string
    }
  }
}

type FileRemoveParams = {
  projectId: string
  ids: string[]
}

type ListFilesParams = IPaginatedParams & {
  project: string
  folder?: string
  includeDescProps?: boolean
}

type FileCreateParams = {
  name: string
  description: string
  project: string
}

type FileCloseParams = {
  fileDxid: string
}

type FileDescribeParams = {
  fileDxid: string
  projectDxid: string
}

type FileDownloadLinkParams = {
  fileDxid: string
  filename: string
  project: string
  duration: number // in seconds
  preauthenticated?: boolean
}

type FileGetUploadUrlParams = {
  dxid: string
  size: number
  md5: string
  index: number
}

type FileStatesParams = {
  fileDxids: string[]
  projectDxid: string
}

type DescribeFoldersParams = {
  projectId: string
}

type RenameFolderParams = {
  folderPath: string
  newName: string
  projectId: string
}

type RemoveFolderParams = {
  folderPath: string
  projectId: string
}

type CreateFolderParams = {
  folderPath: string
  projectId: string
}

type OrgFindMembersParams = {
  orgDxid: string
}

type UserInviteToOrgParams = {
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
type UserRemoveFromOrgParams = {
  orgDxId: string
  data: {
    user: string
    revokeProjectPermissions?: boolean
    revokeAppsPermissions?: boolean
  }
}

type MoveFilesParams = {
  destinationFolderPath: string
  fileIds: string[]
  projectId: string
}

type DbClusterCreateParams = {
  name: string
  project: string
  engine: string
  engineVersion: string
  dxInstanceClass: string
  adminPassword: string
}

type DbClusterDescribeParams = {
  dxid: string
  project?: string
}

type DbClusterActionParams = { dxid: string }

type ObjectsParams = {
  objects: string[]
}

type DescribeDataObjectsParams = {
  objects: Array<string | Record<string, string>>
}

export type OrgDescribeParams = {
  dxid: string
  defaultFields?: boolean
  fields?: any
}

type UserDescribeParams = {
  dxid: string
  defaultFields?: boolean
  fields?: any
}

type UserResetMfaParams = {
  dxid: string
  data: {
    user_id: string
    org_id: string
  }
}

type UserUnlockParams = {
  dxid: string
  data: {
    user_id: string
    org_id: string
  }
}

type AppDescribeParams = {
  dxid: string
}

type WorkflowDescribeParams = {
  dxid: string
}

type CloneObjectsParams = {
  sourceProject: string
  destinationProject: string
  objects: string[]
}

type ProjectLeaveParams = {
  projectDxid: string
}

export {
  AppAddAuthorizedUsersParams,
  AppCreateParams,
  AppDescribeParams,
  AppletCreateParams,
  AppPublishParams,
  CloneObjectsParams,
  CreateFolderParams,
  DbClusterActionParams,
  DbClusterCreateParams,
  DbClusterDescribeParams,
  DescribeDataObjectsParams,
  DescribeFoldersParams,
  FileCloseParams,
  FileCreateParams,
  FileDescribeParams,
  FileDownloadLinkParams,
  FileGetUploadUrlParams,
  FileRemoveParams,
  FileStatesParams,
  IPaginatedParams,
  JobCreateParams,
  JobDescribeParams,
  JobFindParams,
  JobTerminateParams,
  ListFilesParams,
  MoveFilesParams,
  ObjectsParams,
  OrgFindMembersParams,
  PackageMapping,
  ProjectLeaveParams,
  RemoveFolderParams,
  RenameFolderParams,
  Starting,
  UserDescribeParams,
  UserInviteToOrgParams,
  UserRemoveFromOrgParams,
  UserResetMfaParams,
  UserUnlockParams,
  WorkflowDescribeParams,
}
