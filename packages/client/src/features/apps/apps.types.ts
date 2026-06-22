import type { ComputeResourceKey } from '@/types/user'
import type { Asset } from '../actionModals/AttachToModal/useListAssetsQuery'
import type { Note } from '../actionModals/AttachToModal/useListNotesQuery'
import type { IJob } from '../executions/executions.types'
import type { FileUid } from '../files/files.types'
import type { HomeScope, ServerScope } from '../home/types'
import type { CreateAppPayload } from './apps.api'

export interface IOSpec {
  class: 'string' | 'array:string' | 'file' | 'array:file' | 'int' | 'array:int' | 'float' | 'array:float' | 'boolean'
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


export type ResourceProperties = { [key: string]: string }

export interface AppUser {
  dxuser: string
  full_name: string
}

export interface IApp {
  id: number
  uid: string
  dxid: string
  entityType: string
  name: string
  title: string
  addedBy: string
  addedByFullname: string
  createdAt: string
  createdAtDateTime: string
  updatedAt: string
  location: HomeScope | 'Private'
  readme: string
  revision: number
  latestRevision: boolean
  jobCount: number
  appSeriesId: number
  runByYou: string
  org: string
  explorers: number
  featured: boolean
  active: boolean
  user: AppUser
  tags: string[]
  properties: ResourceProperties
  scope: ServerScope
  forkedFrom: string | null
}

export interface AppRevision {
  id: number
  revision: number
  tagList: []
  title: string
  uid: string
  version: string
  deleted: boolean
}

export interface OutputSpec extends IOSpec {
  requiredRunInput: boolean
}

export interface AppSpec {
  instanceType: ComputeResourceKey
  internetAccess: boolean
  inputSpec: InputSpec[]
  outputSpec: OutputSpec[]
}

export interface AppMeta {
  answers: []
  assigned_challenges: []
  challenges: []
  comments: []
  comparator: boolean
  default_comparator: boolean
  discussions: []
  jobs: IJob[]
  notes: Note[]
  revisions: AppRevision[]
  spec: AppSpec
}

export interface FileUser {
  dxuser: string
  full_name: string
}

export interface FileOrg {
  handle: string
  name: string
}

export interface AcceptedLicense {
  id: number
  license: number // ID of actual license that is accepted
  message: string
  state: string
  user: number // ID of the user
}

export interface ComputeInstance {
  value: string
  label: string
}

export interface SelectType {
  isDisabled?: boolean
  label: string
  value: string
}

export type FormInput =
  | string
  | string[]
  | boolean
  | number
  | number[]
  | FileUid
  | FileUid[]
  | ComputeInstance
  | null
  | undefined

export interface BatchInput {
  id?: number
  instanceType: ComputeInstance | null
  fields: { [key: string]: FormInput }
}

export interface RunJobFormType {
  outputFolderPath: string | null
  jobName: string
  jobLimit: number
  scope: SelectType
  inputs: BatchInput[]
}

export interface InputSpecForm extends Omit<InputSpec, 'choices' | 'default'> {
  choices: string[] | null
  default: null | string[]
}

export interface CreateAppForm extends Omit<CreateAppPayload, 'ordered_assets' | 'input_spec'> {
  ordered_assets: Asset[]
  input_spec: InputSpecForm[]
}

export type FileType = 'cwl' | 'wdl'

export interface SelectableSpace {
  isDisabled: boolean
  label: string
  value: string
}
