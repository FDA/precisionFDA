import { COMPUTE_RESOURCE_LABELS } from '@/types/user'
import { RESOURCE_TYPES } from '../admin/users/types'
import { FileOrg, FileUser, FormInput, IOSpec } from '../apps/apps.types'
import { ServerScope } from '../home/types'

type Links = Record<string, string>

export type RunInputs = { [key: string]: FormInput }
export type RunOutputs = Record<string, string | null>

interface RunDataUpdates {
  output_folder_path: string
  run_instance_type: (typeof RESOURCE_TYPES)[number]
  run_inputs: RunInputs
  run_outputs: RunOutputs | null
}

interface Links2 {
  show: string
  user: string
  workflow: string
  publish: string
  log: string
  track: string
  attach_to: string
  copy: string
  app?: string
}

export type JobState = 'done' | 'failed' | 'idle' | 'running' | 'runnable' | 'terminated' | 'terminating'

export type RunData = {
  label: string
  name: string
  class: IOSpec['class']
  value: FormInput
  state?: 'deleted' | string
  file_name?: string
  scope?: ServerScope
  file_uid?: string
  file_names?: string[]
  file_uids?: string[]
  scopes?: ServerScope[]
  type?: string
  link?: string[] | string
}

export interface Job {
  id: number
  uid: string
  state: JobState
  name: string
  app_title: string
  app_revision: number
  app_active: boolean
  workflow_title: string
  workflow_uid: string
  run_input_data: RunData[]
  run_output_data: RunData[]
  run_data_updates: RunDataUpdates
  instance_type: keyof typeof COMPUTE_RESOURCE_LABELS
  duration: string
  duration_in_seconds: number
  energy_consumption: string
  failure_reason: string
  failure_message: string
  created_at: string
  created_at_date_time: string
  scope: string
  location: string
  launched_by: string
  launched_on: string
  featured: boolean
  /** @deprecated create links from client side */
  links: Links2
  entity_type: string
  logged_dxuser: string
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

export interface IExecution {
  id: number | string
  state: JobState
  uid: string
  dxid: string
  name: string
  title: string
  added_by: string
  app_revision: number
  app_active: boolean
  app_uid: string
  app_title: string
  workstation_api_version: string | null
  run_input_data: RunData[]
  run_output_data: RunData[]
  run_data_updates?: RunDataUpdates
  failure_message?: string
  failure_reason?: string
  created_at: string
  created_at_date_time: string
  energy_consumption: string
  cost_limit: number
  duration: string
  duration_in_seconds: number
  startedRunning?: number
  stoppedRunning?: number
  showLicensePending?: boolean
  instance_type: keyof typeof COMPUTE_RESOURCE_LABELS
  launched_by: string
  launched_by_dxuser: string
  launched_on: string
  location: string
  revision: number
  readme: string
  workflow_series_id: number | string
  version: string
  scope: ServerScope
  featured: boolean
  active: boolean
  /** @deprecated create links from client side */
  links: Links
  jobs?: Job[]
  logged_dxuser: string
  tags: string[]
  properties: {
    [key: string]: string
  }
  workflow_uid?: string
  platform_tags?: null
  workflow_title?: string
  snapshot: boolean
  entity_type: 'regular' | 'https'
}

// IExeuction's uid attribute can have the following prefixes
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
