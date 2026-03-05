import { COMPUTE_RESOURCE_LABELS } from '@/types/user'
import { InputSpec as AppInputSpec, IOSpec } from '../apps/apps.types'
import { IExecution } from '../executions/executions.types'
import { IMeta, ServerScope } from '../home/types'

export interface Spec2 {
  input_spec: AppInputSpec[]
  output_spec: IOSpec[]
  internet_access: boolean
  instance_type: string
}

export interface Internal {
  packages: string[]
  code: string
}

export interface App {
  id: number
  dxid: string
  version?: number
  revision: number
  title: string
  readme: string
  user_id: number
  scope: string
  spec: Spec2
  internal: Internal
  created_at: string
  updated_at: string
  app_series_id: number
  verified: boolean
  uid: string
  release: string
  entity_type: string
  featured: boolean
  deleted: boolean
  tag_list: string[]
}

export interface WorkflowRevision {
  id: number
  title: string
  dxid: string
  revision: number
  uid: string
  tag_list: string[]
  deleted: boolean
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Batches {}

export interface Links2 {
  comments: string
  edit_tags: string
}

export interface Value {
  id: string
  name: string
}

export interface InputOutput {
  class: string
  default_workflow_value: 'input value'
  label: string
  name: string
  choices: []
  optional: boolean
  parent_slot: string
  requiredRunInput: boolean
  stageName: string
  values: Value
  help?: string
}

export interface Stage {
  name: string
  prev_slot?: unknown
  next_slot?: unknown
  slotId: string
  app_dxid: string
  app_uid: string
  inputs: InputOutput[]
  outputs: InputOutput[]
  instanceType: keyof typeof COMPUTE_RESOURCE_LABELS
  stageIndex: number
}

export interface InputSpec {
  stages: Stage[]
}

export interface OutputSpec {
  stages: unknown[]
}
export interface Spec {
  input_spec: InputSpec
  output_spec: OutputSpec
}
export interface WorkflowMeta extends IMeta {
  apps: App[]
  revisions: WorkflowRevision[]
  executions: Map<number, IExecution>
  batches: Batches
  links: Links2
  pagination?: IMeta['pagination']
  spec: Spec
}

export interface Links {
  show: string
  user: string
  attach_to: string
  publish: string
  copy: string
  run_workflow: string
  batch_run_workflow: string
  edit: string
  fork: string
  cwl_export: string
  wdl_export: string
  set_tags: string
  set_tags_target: string
  delete: string
  space: string
  diagram: string
  feature: string
}

export interface IWorkflow {
  id: number
  uid: string
  name: string
  title: string
  added_by: string
  created_at: string
  created_at_date_time: string
  launched_by: string
  launched_on?: string
  app_title: string
  location: string
  revision: number
  job_count: number
  readme: string
  workflow_series_id: number
  version: string
  scope: ServerScope
  featured: boolean
  active: boolean
  /** @deprecated create links from client side */
  links: Links
  jobs?: IExecution[]
  logged_dxuser: string
  tags: string[]
  properties: {
    [key: string]: string
  }
}

export interface FetchWorkflowRequest {
  meta: WorkflowMeta
  workflow: IWorkflow
}
