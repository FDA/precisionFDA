import type { InputSpec, IOSpec } from '../apps.types'
import { mapFromServerToForm, mapIOSpecFromServerToForm } from './common'

const buildSpec = (specClass: IOSpec['class']): IOSpec => ({
  class: specClass,
  name: 'value',
  label: '',
  help: '',
  optional: false,
})

describe('mapIOSpecFromServerToForm', () => {
  test.each<[IOSpec['class'], boolean]>([
    ['array:string', true],
    ['array:file', true],
    ['array:int', true],
    ['array:float', true],
    ['string', false],
    ['file', false],
    ['int', false],
    ['float', false],
    ['boolean', false],
  ])('maps %s to isArray=%s without changing its class', (specClass, isArray) => {
    const result = mapIOSpecFromServerToForm(buildSpec(specClass))

    expect(result.class).toBe(specClass)
    expect(result.isArray).toBe(isArray)
  })
})

describe('mapFromServerToForm', () => {
  test('preserves input conversions while adding array form state', () => {
    const spec: InputSpec = {
      ...buildSpec('array:string'),
      choices: ['alpha', 'beta'],
      default: ['alpha'],
    }

    const result = mapFromServerToForm(spec)

    expect(result).toMatchObject({
      class: 'array:string',
      isArray: true,
      choices: 'alpha,beta',
      default: ['alpha'],
    })
  })
})
