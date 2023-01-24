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

type ListFilesParams = IPaginatedParams & {
  project: string
  folder?: string
  includeDescProps?: boolean
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
}

type FileStatesParams = {
  fileDxids: string[]
  projectDxid: string
}

type DescribeFilesParams = {
  fileIds: string[]
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

type FindSpaceMembersParams = {
  spaceOrg: string
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

type DescribeDataObjectsParams = {
  objects: Array<string | Record<string, string>>
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
  data: {}
}
type WorkflowDescribeParams = {
  dxid: string
  data: {}
}

export {
  Starting,
  IPaginatedParams,
  FileCloseParams,
  FileDescribeParams,
  FileDownloadLinkParams,
  FileStatesParams,
  ListFilesParams,
  JobDescribeParams,
  JobCreateParams,
  JobTerminateParams,
  CreateFolderParams,
  DescribeFoldersParams,
  MoveFilesParams,
  DbClusterActionParams,
  DbClusterDescribeParams,
  DbClusterCreateParams,
  DescribeFilesParams,
  FindSpaceMembersParams,
  UserInviteToOrgParams,
  UserRemoveFromOrgParams,
  RemoveFolderParams,
  RenameFolderParams,
  DescribeDataObjectsParams,
  UserResetMfaParams,
  UserUnlockParams,
  AppDescribeParams,
  WorkflowDescribeParams,
}
