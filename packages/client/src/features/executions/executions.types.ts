import { COMPUTE_RESOURCE_LABELS } from '@/types/user'
import { RESOURCE_TYPES } from '../admin/users/types'
import { FileOrg, FileUser, FormInput, IOSpec } from '../apps/apps.types'
import { ServerScope } from '../home/types'

export type RunInputs = { [key: string]: FormInput }
export type RunOutputs = Record<string, string | null>

export interface RunDataUpdates {
  output_folder_path: string
  run_instance_type: (typeof RESOURCE_TYPES)[number]
  run_inputs: RunInputs
  run_outputs: RunOutputs | null
}

export type JobState = 'done' | 'failed' | 'idle' | 'running' | 'runnable' | 'terminated' | 'terminating'

export type RunData = {
  label: string
  name: string
  class: IOSpec['class']
  value: FormInput
  state?: 'deleted' | string
  fileName?: string
  scope?: ServerScope
  fileUid?: string
  fileNames?: string[]
  fileUids?: string[]
  scopes?: ServerScope[]
  type?: string
  link?: string[] | string
}

export interface Job {
  id: number
  uid: string
  state: JobState
  name: string
  appTitle: string
  appRevision: number
  appActive: boolean
  workflowTitle: string
  workflowUid: string
  runInputData: RunData[]
  runOutputData: RunData[]
  runDataUpdates: RunDataUpdates
  instanceType: keyof typeof COMPUTE_RESOURCE_LABELS
  duration: string
  durationInSeconds: number
  energyConsumption: string
  failureReason: string
  failureMessage: string
  createdAt: string
  createdAtDateTime: string
  scope: string
  location: string
  launchedBy: string
  launchedOn: string
  featured: boolean
  entityType: string
  loggedDxuser: string
  tags: string[]
}

export interface IJob {
  id: number
  uid: string
  className: string
  fa_class: string
  scope: ServerScope
  path: string
  owned: boolean
  editable: boolean
  accessible: boolean
  file_path: null | string
  parent_folder_name: null | string
  public: boolean
  private: boolean
  in_space: boolean
  space_private: boolean
  space_public: boolean
  title: string
  user: FileUser
  org: FileOrg
}

export interface ExecutionBase {
  id: number | string
  state: JobState
  uid: string
  dxid: string
  name: string
  appRevision: number | null
  appActive: boolean
  appUid: string | null
  appTitle: string | null
  workstationApiVersion: string | null
  runInputData: RunData[]
  runOutputData: RunData[]
  runDataUpdates?: RunDataUpdates
  failureMessage?: string
  failureReason?: string
  createdAt: string
  createdAtDateTime: string
  energyConsumption: string
  costLimit: number | null
  duration: string
  durationInSeconds: number
  startedRunning?: number | null
  stoppedRunning?: number | null
  showLicensePending?: boolean
  instanceType: keyof typeof COMPUTE_RESOURCE_LABELS
  launchedBy: string
  launchedByDxuser: string
  launchedOn: string
  location: string
  scope: ServerScope
  featured: boolean
  loggedDxuser: string
  tags: string[]
  properties: {
    [key: string]: string
  }
  snapshot: boolean
  entityType: 'regular' | 'https'
  httpsAppState?: JobState | null
  jobs?: Job[]
  platformTags: string[] | null
}

export interface ExecutionListItem extends ExecutionBase {
  workflowUid: string
  workflowTitle: string
  title: string
  addedBy: string
  revision: number
  readme: string
  workflowSeriesId: number | string
  version: string
  active: boolean
  isPublishable: boolean
}

export type ExecutionDetail = ExecutionBase

/**
 * Legacy alias kept for broad call sites; prefer `ExecutionListItem` or `ExecutionDetail`
 * when endpoint shape is known.
 */
export type IExecution = ExecutionBase

// IExecution uid can have the following prefixes
export const jobExecutionPrefix = 'job-'
export const workflowExecutionPrefix = 'workflow-'

export interface Pagination {
  current_page: number
  next_page?: number | null
  prev_page?: number | null
  total_pages: number
  total_count: number
}

export interface Meta {
  count: number
  pagination: Pagination
}

export interface RootObject {
  jobs: Job[]
  meta: Meta
}
