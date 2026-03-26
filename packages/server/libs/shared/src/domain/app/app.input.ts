import { IOType } from '@shared/types/common'

export type AppSpecItem = {
  name: string
  class:
    | 'int'
    | 'string'
    | 'file'
    | 'boolean'
    | 'float'
    | 'array:int'
    | 'array:string'
    | 'array:file'
    | 'array:boolean'
    | 'array:float'
  default?: number | string | boolean | string[] | number[] | boolean[]
  label: string
  help: string
  optional: boolean
}

export type AppInputSpecItem = AppSpecItem & {
  suggestions?: object[]
  choices?: object[]
}

export type AppAccess = {
  network?: string[]
  project?: string
  allProjects?: string
  developer?: boolean
  projectCreation?: boolean
}

export type SystemRequirements = {
  instanceType: string
  nvidiaDriver?: string
}

export type PlatformSpec = AppSpecItem

export type AppRunInput = {
  __pfda_cli_configs: string
  [key: string]: IOType
}
