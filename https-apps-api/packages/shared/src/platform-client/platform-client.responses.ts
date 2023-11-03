import { AnyObject } from '../types'
import { FILE_STATE_DX } from '../domain/user-file/user-file.types'
import { JOB_STATE } from '../domain/job/job.enum'
import { DnanexusLink, IOType } from '../types/common'

type DbClusterDescribeResponse = {
  id: string
  project: string
  name: string
  created: number
  modified: number
  createdBy: { user: string }
  dxInstanceClass: string
  engine: string
  engineVersion: string
  status: string
  endpoint?: string
  port?: string
  statusAsOf?: number
  failureReason?: string
} & AnyObject

interface IPaginatedResponse<T> {
  next?: {
    project: string
    id: string
  }
  results: T[]
}

type FileCloseResponse = {
  id: string
  detail?: string
}

type FileDownloadLinkResponse = {
  url: string
  headers: AnyObject[] // key:value pairs
  expires?: number
}

interface GetUploadURLResponse {
  url: string
  headers: Record<string, string>
  expires: number
}

type ListFilesResult = {
  id: string
  project: string
  describe?: {
    id: string
    name: string
    size: number
    state: FILE_STATE_DX
  }
}

type ListFilesResponse = IPaginatedResponse<ListFilesResult>

type FileStateResult = {
  id: string
  project: string
  describe?: {
    name: string
    size: number
    created: number
    modified: number
    state: FILE_STATE_DX
  }
}

type FileStatesResponse = IPaginatedResponse<FileStateResult>

type DescribeDataObjectsResponse = {
  results: Array<{
    describe?: any[]
    error?: any[]
    statusCode: number
  }>
}

type FileRemoveResponse = {
  id: string
} & AnyObject

type FileDescribeResponse = {
  id: string
  name: string
  state: string
  size?: number
  folder?: string
  class: string
  types: string[]
  tags: string[]
  created: number
  modified: number
  hidden: boolean
  createdBy: any
  // add more here
  // See output of https://documentation.dnanexus.com/developer/api/introduction-to-data-object-classes/files#api-method-file-xxxx-describe
}

type PlatformMember = {
  id: string
  level: 'MEMBER' | 'ADMIN'
  allowBillableActivities: boolean
  projectAccess: 'ADMINISTER' | 'CONTRIBUTE' | 'UPLOAD' | 'VIEW' | 'NONE'
  appAccess: boolean
}

type OrgFindMembersReponse = {
  results: PlatformMember[]
}

export type OrgDescribeResponse = {
  id: string
  class: string
  handle: string
  name: string
  admins?: string[]
  // The rest of the keys are only present if the requesting user is the same as the user being described AND a full scope token is supplied.
  // See https://documentation.dnanexus.com/developer/api/organizations#api-method-org-xxxx-describe
  level?: string
  allowBillableActivities?: boolean
  projectAccess?: string
  appAccess?: boolean
  estSpendingLimitLeft?: number | null
  phiFeaturesEnabled?: boolean
}

type UserDescribeResponse = {
  id: string
  class?: string
  first?: string
  middle?: string
  last?: string
  handle?: string
  // The rest of the keys are only present if the requesting user is the same as the user being described AND a full scope token is supplied.
  // See https://documentation.dnanexus.com/developer/api/users#api-method-user-xxxx-describe
  email?: string
  billTo?: string
}

type UserInviteToOrgResponse = {
  id: string
  state: string
}

type UserRemoveFromOrgResponse = {
  id: string
  projects: AnyObject[] // key:value pairs
  apps: AnyObject[] // key:value pairs
}

type DescribeFoldersResponse = {
  id: string
  folders: string[]
}

type JobCreateResponse = {
  id: string
}

type FindJobsResponse = {
  results: JobDescribeResponse[]
}

type JobTerminateResponse = JobCreateResponse

type ClassIdResponse = {
  id: string
}

// add all actual data provided by platform
type AppDescribeResponse = {
  id: string
}

// add all actual data provided by platform
type WorkflowDescribeResponse = {
  id: string
}

type CloneObjectsResponse = {
  id: string,
  project: string,
}

type JobOutput = {
  [key: string]: IOType
}

// just basic types we are interested in at the moment
type JobDescribeResponse = {
  id: string
  name: string
  state: JOB_STATE
  properties?: {
    httpsAppState?: JOB_STATE
  }
  project: string
  billTo: string
  httpsApp: {
    ports: number[]
    shared_access: string
    enabled: boolean
    dns: {
      url?: string
    }
  }
  describe: {
    output: JobOutput
  }
  failureCount?: any
  failureReason?: string
  failureMessage?: string
  startedRunning?: number
  stoppedRunning?: number
  totalPrice?: number
} & AnyObject

export {
  IPaginatedResponse,
  FileCloseResponse,
  FileDownloadLinkResponse,
  FileStateResult,
  FileStatesResponse,
  ListFilesResult,
  ListFilesResponse,
  JobCreateResponse,
  JobDescribeResponse,
  JobTerminateResponse,
  ClassIdResponse,
  FileDescribeResponse,
  DescribeFoldersResponse,
  DbClusterDescribeResponse,
  DescribeDataObjectsResponse,
  OrgFindMembersReponse,
  PlatformMember,
  UserDescribeResponse,
  UserInviteToOrgResponse,
  FindJobsResponse,
  FileRemoveResponse,
  UserRemoveFromOrgResponse,
  AppDescribeResponse,
  WorkflowDescribeResponse,
  CloneObjectsResponse,
  DnanexusLink,
  JobOutput,
  GetUploadURLResponse,
}
