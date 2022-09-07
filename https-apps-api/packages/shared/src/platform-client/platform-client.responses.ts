import { AnyObject } from '../types'
import { FILE_STATE_DX } from '../domain/user-file/user-file.enum'


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
  port?: number
  statusAsOf?: number
  failureReason?: string
} & AnyObject

type ListFilesResponse = {
  results: Array<{
    id: string
    project: string
    describe?: {
      id: string
      name: string
      size: number
      state: FILE_STATE_DX
    }
  }>
  // if set up, we might want to paginate
  next?: {
    project: string
    id: string
  }
}

type DescribeFilesResponse = {
  results: Array<{
    describe: {
      id: string
      name: string
      size: number
      // add more here
    }
  }>
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

// just basic types we are interested in at the moment
type JobDescribeResponse = {
  state: string
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
  JobCreateResponse,
  JobDescribeResponse,
  JobTerminateResponse,
  ClassIdResponse,
  DescribeFilesResponse,
  DescribeFoldersResponse,
  DbClusterDescribeResponse,
  ListFilesResponse,
  FindSpaceMembersReponse,
  PlatformMember,
}
