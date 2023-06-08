import { IExecution } from '../executions/executions.types'
import { ServerScope } from '../types'

export enum WorkflowActions {
  'Run' = 'Run',
  'Run Batch' = 'Run Batch',
  'Diagram' = 'Diagram',
  'Edit' = 'Edit',
  'Fork' = 'Fork',
  'Export to' = 'Export to',
  'Feature' = 'Feature',
  'Unfeature' = 'Unfeature',
  'Delete' = 'Delete',
  'Copy to space' = 'Copy to space',
  'Comments' = 'Comments',
  'Edit tags' = 'Edit tags',
}

export type WorkflowActionTypes = `${WorkflowActions}`

export enum WorkflowListActions {
  'Create Workflow' = 'Create Workflow',
}


export interface Spec2 {
  input_spec: any[];
  output_spec: any[];
  internet_access: boolean;
  instance_type: string;
}

export interface Internal {
  packages: any[];
  code: string;
}

export interface App {
  id: number;
  dxid: string;
  version?: any;
  revision: number;
  title: string;
  readme: string;
  user_id: number;
  scope: string;
  spec: Spec2;
  internal: Internal;
  created_at: Date;
  updated_at: Date;
  app_series_id: number;
  verified: boolean;
  uid: string;
  dev_group?: any;
  release: string;
  entity_type: string;
  featured: boolean;
  deleted: boolean;
  tag_list: any[];
}

export interface Revision {
  id: number;
  title: string;
  dxid: string;
  revision: number;
  uid: string;
  tag_list: any[];
}

export interface Batches {}

export interface Links2 {
  comments: string;
  edit_tags: string;
}

export interface Value {
  id: string
  name: string
}

export interface InputOutput {
  class: string;
  default_workflow_value: 'input value'
  label: string
  name: string
  choices: []
  optional: boolean;
  parent_slot: string;
  requiredRunInput: boolean;
  stageName: string
  values: Value
}

export interface Stage {
  name: string;
  prev_slot?: any;
  next_slot?: any;
  slotId: string;
  app_dxid: string;
  app_uid: string;
  inputs: InputOutput[];
  outputs: InputOutput[];
  instanceType: string;
  stageIndex: number;
}

export interface InputSpec {
  stages: Stage[];
}

export interface OutputSpec {
  stages: any[];
}
export interface Spec {
  input_spec: InputSpec;
  output_spec: OutputSpec;
}
export interface WorkflowMeta {
  spec: Spec;
  apps: App[];
  revisions: Revision[];
  executions: Map<number, IExecution>;
  batches: Batches;
  challenges?: any;
  comments: any[];
  links: Links2;
}

export interface Links {
  show: string;
  user: string;
  attach_to: string;
  publish: string;
  copy: string;
  run_workflow: string;
  batch_run_workflow: string;
  edit: string;
  fork: string;
  cwl_export: string;
  wdl_export: string;
  set_tags: string;
  set_tags_target: string;
  delete: string;
  space: string;
  diagram: string;
  feature: string;
}

export interface IWorkflow {
  id: string;
  uid: string;
  name: string;
  title: string;
  added_by: string;
  created_at: string;
  created_at_date_time: string;
  launched_by: string;
  launched_on?: any;
  app_title: string;
  location: string;
  revision: number;
  job_count: number;
  readme: string;
  workflow_series_id: number;
  version: string;
  scope: ServerScope;
  featured: boolean;
  active: boolean;
  links: Links;
  jobs?: any;
  logged_dxuser: string;
  tags: any[];
}

export interface FetchWorkflowRequest {
  meta: WorkflowMeta
  workflow: IWorkflow
}