import { AnyObject } from '../../types'

enum ENTITY_TYPE {
  NORMAL = 0,
  HTTPS = 1,
}

type AppSpec = AnyObject & {
  input_spec: AppInputSpecItem[]
  output_spec: any[]
}

type AppInputSpecItem = {
  name: string
  // todo: from the docs this is not accurate
  class: 'int' | 'string' | 'file'
  default: number | string
  label: string
  help: string
  optional: boolean
}

export { ENTITY_TYPE, AppSpec, AppInputSpecItem }
