import { ResourceScope, ServerScope } from '../types'
import { IFile } from '../files/files.types'

export enum AppActions {
  'Run' = 'Run',
  'Run batch' = 'Run batch',
  'Track' = 'Track',
  'Edit' = 'Edit',
  'Fork' = 'Fork',
  'Export to' = 'Export to',
  'Make public' = 'Make public',
  'Feature' = 'Feature',
  'Unfeature' = 'Unfeature',
  'Delete' = 'Delete',
  'Copy to space' = 'Copy to space',
  'Attach to...' = 'Attach to...',
}

export enum AppsListActions {
  'Create App' = 'Create App',
}

export interface Links {
  show: string;
  user: string;
  jobs: string;
  track: string;
  fork: string;
  forked_from: string;
  export: string;
  cwl_export: string;
  wdl_export: string;
  copy: string;
  attach_to: string;
  delete: string;
  edit: string;
  edit_tags: string;
  assign_app: string;
  publish: string;
  run_job: string;
  batch_run: string;
  space?: string;
  feature?: string;
  comments?: string;
}

export interface IApp {
  id: string;
  uid: string;
  dxid: string;
  entity_type: string;
  name: string;
  title: string;
  added_by: string;
  added_by_fullname: string;
  created_at: string;
  created_at_date_time: string;
  updated_at: Date;
  location: ResourceScope | 'Private';
  readme: string;
  revision: number;
  latest_revision: boolean;
  app_series_id: number;
  run_by_you: string;
  job_count: number;
  org: string;
  explorers: number;
  featured: boolean;
  active: boolean;
  links: Links;
  tags: any[];
  scope: ServerScope;
  forked_from: string;
}

export interface Revision {
  id: number;
  revision: number;
  tag_list: [];
  title: string;
  uid: string;
  version: string;
}

export interface SpecBase {
  class: string;
  help: string;
  label: string;
  name: string;
  optional: boolean;
}
export interface OutputSpec extends SpecBase {
  requiredRunInput: boolean;
}
export interface InputSpec extends SpecBase {
  default: string | boolean;
  choices: [];
}

export interface AppSpec {
  instance_type: string;
  internet_access: boolean;
  input_spec: InputSpec[];
  output_spec: OutputSpec[];
}

export interface AppMeta {
  answers: [];
  assigned_challenges: [];
  challenges: [];
  comments: [];
  comparator: boolean;
  default_comparator: boolean;
  discussions: [];
  jobs: [];
  links: Links;
  notes: []
  revisions: Revision[];
  spec: AppSpec;
}

export interface FileUser {
  dxuser: string;
  full_name: string;
}

export interface FileOrg {
  handle: string;
  name: string;
}

export interface AcceptedLicense {
  id: number,
  license: number, // ID of actual license that is accepted
  message: string,
  state: string,
  user: number, // ID of the user
}

export interface ComputeInstance {
  value: string;
  label: string;
}

export interface SelectType {
  isDisabled: boolean,
  label: string,
  value: string,
}

export interface JobRunData {
  jobName: string;
  jobLimit: number;
  scope?: SelectType | null;
  instanceType?: ComputeInstance | null;
  inputs: {
    [key: string]: string | boolean | number | IFile | undefined,
  };
}

export const INPUT_TYPES_CLASSES = {
  FILE: 'file',
  STRING: 'string',
  INT: 'int',
  FLOAT: 'float',
  BOOLEAN: 'boolean',
} 
