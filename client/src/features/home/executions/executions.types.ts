export enum ExecutionActions {
  "Run" = "Run",
  "Run batch" = "Run batch",
  "Track" = "Track",
  "Edit" = "Edit",
  "Fork" = "Fork",
  "Export to" = "Export to",
  "Make public" = "Make public",
  "Delete" = "Delete",
  "Copy to space" = "Copy to space",
  "Attach to..." = "Attach to...",
}


export interface Links {
  app?: string;
  show?: string;
  user?: string;
  attach_to?: string;
  publish?: string;
  copy?: string;
  run_workflow?: string;
  batch_run_workflow?: string;
  edit?: string;
  fork?: string;
  log?: string;
  track?: string;
  feature?: string;
  license?: string;
  cwl_export?: string;
  wdl_export?: string;
  set_tags?: string;
  set_tags_target?: string;
  delete?: string;
  space?: string;
  terminate?: string;
  sync_files?: string;
  open_external?: string;
}

export interface RunInputs {
}

export interface RunOutputs {
}

export interface RunDataUpdates {
  run_instance_type: string;
  run_inputs: RunInputs;
  run_outputs: RunOutputs;
}

export interface Links2 {
  show: string;
  user: string;
  app?: string;
  workflow: string;
  publish: string;
  log: string;
  track: string;
  attach_to: string;
  copy: string;
  run_job: string;
}

export type JobState = 'done' | 'failed' | 'idle' | 'running' | 'terminated' | 'terminating'

export interface Job {
  id: number;
  uid: string;
  state: JobState;
  name: string;
  app_title: string;
  app_revision: number;
  app_active: boolean;
  workflow_title: string;
  workflow_uid: string;
  run_input_data: any[];
  run_output_data: any[];
  run_data_updates: RunDataUpdates;
  instance_type: string;
  duration: string;
  duration_in_seconds: number;
  energy_consumption: string;
  failure_reason: string;
  failure_message: string;
  created_at: string;
  created_at_date_time: string;
  scope: string;
  location: string;
  launched_by: string;
  launched_on: string;
  featured: boolean;
  links: Links2;
  entity_type: string;
  logged_dxuser: string;
  tags: any[];
}

export interface IExecution {
  id: string;
  state: JobState;
  uid: string;
  name: string;
  title: string;
  added_by: string;
  app_revision: string;
  app_uid: string;
  app_title: string;
  run_input_data: Array<any>;
  run_output_data: Array<any>;
  failure_message?: string;
  failure_reason?: string;
  created_at: string;
  created_at_date_time: string;
  energy_consumption: string;
  duration: string;
  instance_type: string;
  launched_by: string;
  launched_on: string;
  location: string;
  revision: number;
  readme: string;
  workflow_series_id: number | string;
  version: string;
  scope: string;
  featured: boolean;
  active: boolean;
  links: Links;
  jobs?: Job[];
  logged_dxuser: string;
  tags: any[];
  workflow_uid?: string;
  workflow_title?: string;
}

// IExeuction's uid attribute can have the following prefixes
export const jobExecutionPrefix = 'job-'
export const workflowExecutionPrefix = 'workflow-'

export interface Pagination {
  current_page: number;
  next_page?: any;
  prev_page?: any;
  total_pages: number;
  total_count: number;
}

export interface Meta {
  count: number;
  pagination: Pagination;
}

export interface RootObject {
  jobs: Job[];
  meta: Meta;
}

