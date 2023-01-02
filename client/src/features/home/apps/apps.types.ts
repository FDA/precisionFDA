import { ResourceScope } from '../types'

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
  scope: string;
}

export interface InputSpec {
  class: string;
  help: string;
  label: string;
  name: string;
  optional: boolean;
  default: string | boolean;
  choices: [];
}

export interface FileUser {
  dxuser: string;
  full_name: string;
}

export interface FileOrg {
  handle: string;
  name: string;
}
export interface ListedFile {
  id: number;
  uid: string;
  className: string;
  fa_class: string
  scope: string;
  path: string;
  owned: boolean;
  editable: boolean;
  accesible: boolean;
  file_path: string;
  parent_folder_name: string;
  public: boolean;
  private: boolean;
  in_space: boolean;
  space_private: boolean,
  space_public: boolean
  title: string;
  description: string;
  state: string;
  file_size: number;
  license: License;
  user_licence: UserLicense;
  user: FileUser;
  org: FileOrg;
}

export interface ListedFiles {
  objects: ListedFile[];
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
  spaceScope?: SelectType | null;
  instanceType?: ComputeInstance | null;
  inputs: {
    [key: string]: string | boolean | number | ListedFile | undefined,
  };
}

export const INPUT_TYPES_CLASSES = {
  FILE: 'file',
  STRING: 'string',
  INT: 'int',
  FLOAT: 'float',
  BOOLEAN: 'boolean',
} 
