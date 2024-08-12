import { DXEnityType, DxId } from '@shared/domain/entity/domain/dxid'
import { PlatformEntityType } from '@shared/domain/entity/domain/platform.entity.type'
import { JOB_STATE } from '../domain/job/job.enum'
import { FILE_STATE_DX } from '../domain/user-file/user-file.types'
import { AnyObject } from '../types'
import { DnanexusLink, IOType } from '../types/common'

type DbClusterDescribeResponse = {
  id: DxId<'dbcluster'>
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
  id: DxId<'file'>
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
  id: DxId<'file'>
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
  id: DxId<'job'>
}

type FindJobsResponse = {
  results: JobDescribeResponse[]
}

type JobTerminateResponse = JobCreateResponse

type ClassIdResponse<
  ENTITY extends DXEnityType | PlatformEntityType = DXEnityType | PlatformEntityType,
> = {
  id: DxId<ENTITY>
}

class AppDescribeResponse {
  id: string
  class: string
  billTo: string
  created: number
  modified: number
  createdBy: string
  name: string
  version: string
  aliases: string[]
  deleted: boolean
  region: string
  applet: string
  regionalOptions: { [key: string]: RegionalOption }
  openSource: boolean
  ignoreReuse: boolean
  installed: boolean
  installs: number
  isDeveloperFor: boolean
  authorizedUsers: string[]
  dxapi: string
  title: string
  summary: string
  description: string
  access: any // don't know what this could be
  lineItemPerTest: any // don't know what this could be
  inputSpec: InputSpec[]
  outputSpec: OutputSpec[]
  runSpec: RunSpec
  details: Details
  categories: string[]
  resources: string
}

type RegionalOption = {
  applet: string
  resources: string
}

type InputSpec = {
  name: string
  class: string
  label: string
  help: string
  optional: boolean
}

type OutputSpec = {
  name: string
  class: string
  label: string
  help: string
  optional: boolean
}

type RunSpec = {
  interpreter: string
  bundledDependsByRegion: { [key: string]: any[] }
  systemRequirements: { [key: string]: any }
  executionPolicy: {}
  headJobOnDemand: boolean
  execDepends: any[] // don't know what this could be
  distribution: string
  release: string
  version: string
  systemRequirementsByRegion: { [key: string]: any }
}

type Details = {
  ordered_assets: any[] // don't know what this could be
}

class WorkflowDescribeResponse {
  id: string
  project: string
  class: string
  sponsored: boolean
  name: string
  types: any[] // don't know what this could be
  state: string
  hidden: boolean
  links: any[] // don't know what this could be
  folder: string
  tags: any[] // don't know what this could be
  created: number
  modified: number
  createdBy: string
  editVersion: number
  title: string
  summary: string
  description: string
  outputFolder: string | null
  temporary: boolean
  inputs: any // don't know what this could be
  outputs: any // don't know what this could be
  stages: Stage[]
  inputSpec: SpecItem[]
  outputSpec: SpecItem[]
}

interface Stage {
  id: string
  name: string
  executable: string
  folder: string | null
  input: any // don't know what this could be
  executionPolicy: any // don't know what this could be
  systemRequirements: any[]
  accessible: boolean
}

// Define interfaces for InputSpec and OutputSpec
interface SpecItem {
  name: string
  class: string
  label: string
  help: string
  optional: boolean
  group: string
  default?: any // don't know what this could be
}

type CloneObjectsResponse = {
  id: string
  project: string
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
  describe?: {
    output: JobOutput
  }
  failureCount?: number
  failureReason?: string
  failureMessage?: string
  startedRunning?: number
  stoppedRunning?: number
  totalPrice?: number
} & AnyObject

//TODO: this will start to grow significantly, consider splitting into multiple files/modules.
export {
  AppDescribeResponse,
  ClassIdResponse,
  CloneObjectsResponse,
  DbClusterDescribeResponse,
  DescribeDataObjectsResponse,
  DescribeFoldersResponse,
  DnanexusLink,
  FileCloseResponse,
  FileDescribeResponse,
  FileDownloadLinkResponse,
  FileRemoveResponse,
  FileStateResult,
  FileStatesResponse,
  FindJobsResponse,
  GetUploadURLResponse,
  IPaginatedResponse,
  JobCreateResponse,
  JobDescribeResponse,
  JobOutput,
  JobTerminateResponse,
  ListFilesResponse,
  ListFilesResult,
  OrgFindMembersReponse,
  PlatformMember,
  UserDescribeResponse,
  UserInviteToOrgResponse,
  UserRemoveFromOrgResponse,
  WorkflowDescribeResponse,
}
