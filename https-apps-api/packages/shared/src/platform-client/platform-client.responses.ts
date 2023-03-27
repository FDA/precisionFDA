import { AnyObject } from '../types'
import { FILE_STATE_DX } from '../domain/user-file/user-file.types'
import { JOB_STATE } from '../domain/job/job.enum'

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

type FindSpaceMembersReponse = {
  results: PlatformMember[]
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

// just basic types we are interested in at the moment
type JobDescribeResponse = {
  state: JOB_STATE
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
  failureCπount?: any
  failureReason?: string
  failureMessage?: string
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
  FindSpaceMembersReponse,
  PlatformMember,
  UserInviteToOrgResponse,
  FileRemoveResponse,
  UserRemoveFromOrgResponse,
  AppDescribeResponse,
  WorkflowDescribeResponse,
}
