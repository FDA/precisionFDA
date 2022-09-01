import { AnyObject } from '../types'

// TODO(samuel) refactor this so that headers aren't mixed with URL params
type BaseParams = {
  accessToken: string
}

type JobDescribeParams = BaseParams & { jobId: string }
type JobTerminateParams = BaseParams & { jobId: string }

type JobCreateParams = BaseParams & {
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

type ListFilesParams = BaseParams & {
  project: string
  folder?: string
  includeDescProps?: boolean
  // the API uses it as a starting point when doing pagination
  starting?: {
    project: string
    id: string
  }
}

type DescribeFilesParams = BaseParams & {
  fileIds: string[]
}

type DescribeFoldersParams = BaseParams & {
  projectId: string
}

type RenameFolderParams = BaseParams & {
  folderPath: string
  newName: string
  projectId: string
}

type RemoveFolderParams = BaseParams & {
  folderPath: string
  projectId: string
}

type CreateFolderParams = BaseParams & {
  folderPath: string
  projectId: string
}

type FindSpaceMembersParams = BaseParams & {
  spaceOrg: string
}

type MoveFilesParams = BaseParams & {
  destinationFolderPath: string
  fileIds: string[]
  projectId: string
}

type DbClusterCreateParams = BaseParams & {
  name: string
  project: string
  engine: string
  engineVersion: string
  dxInstanceClass: string
  adminPassword: string
}

type DbClusterDescribeParams = BaseParams & {
  dxid: string
  project?: string
}

type DbClusterActionParams = BaseParams & { dxid: string }

type UserResetMfaParams = {
  headers: BaseParams
  dxid: string
  data: {
    user_id: string
    org_id: string
  }
}

type UserUnlockParams = {
  headers: BaseParams
  dxid: string
  data: {
    user_id: string
    org_id: string
  }
}

export {
  BaseParams,
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
  RemoveFolderParams,
  RenameFolderParams,
  ListFilesParams,
  UserResetMfaParams,
  UserUnlockParams
}
