enum ENTITY_TYPE {
  NORMAL = 0,
  HTTPS = 1,
}

type AppInputSpecItem = {
  name: string
  // todo: from the docs this is not accurate
  class: 'int' | 'string' | 'file' | 'array:file'
  default: number | string
  label: string
  help: string
  optional: boolean
}

export { ENTITY_TYPE, AppInputSpecItem }
