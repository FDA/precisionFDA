class PlatformSpec {
  class: string
  help: string
  label: string
  name: string
  optional: boolean
}
class Spec extends PlatformSpec {
  default?: any
  choices?: any[]
  patterns?: any[]
}

export { PlatformSpec, Spec }
