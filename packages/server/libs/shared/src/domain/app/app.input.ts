import { Uid } from '@shared/domain/entity/domain/uid'
import { JSONSchema7 } from 'json-schema'

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

type AppInput = {
  is_new: boolean
  forked_from?: string
  name: string
  scope?: string
  title: string
  release: string // ubuntu version
  readme: string
  internet_access: boolean
  instance_type: string
  packages: string[]
  code: string
  ordered_assets?: Uid<'file'>[] // file uids
  entity_type: string
  input_spec: Spec[]
  output_spec: Spec[]
}

const saveAppSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    is_new: { type: 'boolean' },
    forked_from: { type: 'string' }, // not required
    name: { type: 'string' },
    scope: { type: 'string' }, // not required
    title: { type: 'string' },
    release: { type: 'string' },
    readme: { type: 'string' },
    internet_access: { type: 'boolean' },
    instance_type: { type: 'string' },
    packages: { type: 'array' },
    code: { type: 'string' },
    ordered_assets: { type: 'array' },
    entity_type: { type: 'string' },
    input_spec: { type: 'array' },
    output_spec: { type: 'array' }, // not required
  },
  required: [
    'is_new',
    'name',
    'title',
    'release',
    'readme',
    'internet_access',
    'instance_type',
    'packages',
    'code',
    'input_spec',
  ],
  additionalProperties: true,
}

export { AppInput, PlatformSpec, saveAppSchema, Spec }
