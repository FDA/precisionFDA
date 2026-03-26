import { DXEntityType, DxId } from '@shared/domain/entity/domain/dxid'
import { PlatformEntityType } from '@shared/domain/entity/domain/platform.entity.type'
import { JOB_STATE } from '../domain/job/job.enum'
import { FILE_STATE_DX } from '../domain/user-file/user-file.types'
import { AnyObject } from '../types'
import { IOType } from '../types/common'
export { DnanexusLink } from '../types/common'

export type DbClusterDescribeResponse = {
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

export interface IPaginatedResponse<T> {
  next?: {
    project: string
    id: string
  }
  results: T[]
}

export type FileCloseResponse = {
  id: string
  detail?: string
}

export type FileDownloadLinkResponse = {
  url: string
  headers: AnyObject[] // key:value pairs
  expires?: number
}

export interface GetUploadURLResponse {
  url: string
  headers: Record<string, string>
  expires: number
}

export type ListFilesResult = {
  id: DxId<'file'>
  project: string
  describe?: {
    id: string
    name: string
    size: number
    state: FILE_STATE_DX
  }
}

export type ListFilesResponse = IPaginatedResponse<ListFilesResult>

export type FileStateResult = {
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

export type FileStatesResponse = IPaginatedResponse<FileStateResult>

export type DescribeDataObjectsResponse = {
  results: Array<{
    describe?: unknown[]
    error?: unknown[]
    statusCode: number
  }>
}

export type FileRemoveResponse = {
  id: string
} & AnyObject

export type FileDescribeResponse = {
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
  createdBy: string
  // add more here
  // See output of https://documentation.dnanexus.com/developer/api/introduction-to-data-object-classes/files#api-method-file-xxxx-describe
}

export type PlatformMember = {
  id: string
  level: 'MEMBER' | 'ADMIN'
  allowBillableActivities: boolean
  projectAccess: 'ADMINISTER' | 'CONTRIBUTE' | 'UPLOAD' | 'VIEW' | 'NONE'
  appAccess: boolean
}

export type OrgFindMembersReponse = {
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

export type CloudResourcesResponse = {
  id: string
  computeCharges: number
  storageCharges: number
  dataEgressCharges: number
}

export type OrgUpdateBillingResponse = {
  message: string
  status: string
}

export type UserCreateResponse = {
  emailSentTo: string
  message: string
  status: string
  userId: string
}

export type UserDescribeResponse = {
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

export type UserInviteToOrgResponse = {
  id: string
  state: string
}

export type UserRemoveFromOrgResponse = {
  id: string
  projects: AnyObject[] // key:value pairs
  apps: AnyObject[] // key:value pairs
}

export type DescribeFoldersResponse = {
  id: string
  folders: string[]
}

export type JobCreateResponse = {
  id: DxId<'job'>
}

export type FindJobsResponse = {
  results: JobDescribeResponse[]
}

export type JobTerminateResponse = JobCreateResponse

export type ClassIdResponse<
  ENTITY extends DXEntityType | PlatformEntityType = DXEntityType | PlatformEntityType,
> = {
  id: DxId<ENTITY>
}

export class AppDescribeResponse {
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
  access: unknown // don't know what this could be
  lineItemPerTest: unknown // don't know what this could be
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
  bundledDependsByRegion: { [key: string]: unknown[] }
  systemRequirements: { [key: string]: unknown }
  executionPolicy: object
  headJobOnDemand: boolean
  execDepends: unknown[] // don't know what this could be
  distribution: string
  release: string
  version: string
  systemRequirementsByRegion: { [key: string]: unknown }
}

type Details = {
  ordered_assets: unknown[] // don't know what this could be
}

export class WorkflowDescribeResponse {
  id: string
  project: string
  class: string
  sponsored: boolean
  name: string
  types: unknown[] // don't know what this could be
  state: string
  hidden: boolean
  links: unknown[] // don't know what this could be
  folder: string
  tags: unknown[] // don't know what this could be
  created: number
  modified: number
  createdBy: string
  editVersion: number
  title: string
  summary: string
  description: string
  outputFolder: string | null
  temporary: boolean
  inputs: unknown // don't know what this could be
  outputs: unknown // don't know what this could be
  stages: Stage[]
  inputSpec: SpecItem[]
  outputSpec: SpecItem[]
}

interface Stage {
  id: string
  name: string
  executable: string
  folder: string | null
  input: unknown // don't know what this could be
  executionPolicy: unknown // don't know what this could be
  systemRequirements: unknown[]
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
  default?: unknown // don't know what this could be
}

export type CloneObjectsResponse = {
  id: string
  project: string
}

export type JobOutput = {
  [key: string]: IOType
}

// just basic types we are interested in at the moment
export type JobDescribeResponse = {
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

export type UpdateBillingInformationResponse = {
  message: string
  status: string
}
