import { Asset } from '../actionModals/AttachToModal/useListAssetsQuery'
import { HomeScope, ServerScope } from '../home/types'
import { CreateAppPayload } from './apps.api'
import { IFile } from '../files/files.types'
import { IAccessibleFile } from '../databases/databases.api'

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

export enum PricingMap {
  "baseline-2" = 0.286,
  "baseline-4" = 0.572,
  "baseline-8" = 1.144,
  "baseline-16" = 2.288,
  "baseline-36" = 5.148,
  "hidisk-2" = 0.372,
  "hidisk-4" = 0.744,
  "hidisk-8" = 1.488,
  "hidisk-16" = 2.976,
  "hidisk-36" = 6.696,
  "himem-2" = 0.474,
  "himem-4" = 0.948,
  "himem-8" = 1.896,
  "himem-16" = 3.792,
  "himem-32" = 7.584,
  "gpu-8" = 10.787,
}

export enum AppsListActions {
  'Create App' = 'Create App',
}

export interface IOSpec {
  class: 'string'| 'array:string' | 'file' | 'array:file' | 'int' | 'array:int' | 'float' | 'array:float' | 'boolean'
  isArray?: boolean
  help: string
  label: string
  name: string
  optional: boolean
}

export interface InputSpec extends IOSpec {
  default: string[] | string | number | null
  choices: string[] | null
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
  id: number;
  uid: string;
  dxid: string;
  entity_type: string;
  name: string;
  title: string;
  added_by: string;
  added_by_fullname: string;
  created_at: string;
  created_at_date_time: string;
  updated_at: string;
  location: HomeScope | 'Private';
  readme: string;
  revision: number;
  latest_revision: boolean;
  job_count: number;
  app_series_id: number;
  run_by_you: string;
  org: string;
  explorers: number;
  featured: boolean;
  active: boolean;
  /** @deprecated create links from client side */
  links: Links | any;
  tags: string[];
  properties: {
    [key: string]: string;
  };
  scope: ServerScope;
  forked_from?: string;
}

export interface Revision {
  id: number;
  revision: number;
  tag_list: [];
  title: string;
  uid: string;
  version: string;
}

export interface OutputSpec extends IOSpec {
  requiredRunInput: boolean;
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
  isDisabled?: boolean,
  label: string,
  value: string,
}

export type FormInput = string | string[] | boolean | number | number[] | IAccessibleFile | IAccessibleFile[] | undefined

export interface JobRunForm {
  output_folder_path: string | null;
  jobName: string;
  jobLimit: number;
  scope: SelectType;
  instanceType?: ComputeInstance | null;
  inputs: {
    [key: string]: FormInput,
  };
}

export interface InputSpecForm extends Omit<InputSpec, 'choices' | 'default'> {
  choices: string[] | null
  default: null | string[] | IAccessibleFile[]
}

export interface CreateAppForm extends Omit<CreateAppPayload, 'ordered_assets' | 'input_spec'> {
  ordered_assets: Asset[]
  input_spec: InputSpecForm[]
}

export type FileType = 'cwl' | 'wdl'
