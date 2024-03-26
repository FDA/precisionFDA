/* eslint-disable func-names */
import * as Yup from 'yup'
import { toString } from 'lodash'
import { IOSpec, InputSpec, InputSpecForm } from '../apps.types'
import { csvToArray } from '../../../utils/csvToArray'
import { stringToSnakeCase } from '../../../utils/stringToSnakeCase'
import { IAccessibleFile } from '../../databases/databases.api'
import '../../../utils/yupValidators'

export const formatCSVStringToArray = (csvVal: string | null) => {
  if(csvVal === null || csvVal.length === 0) {
    return null
  }
  return csvToArray(csvVal)[0].map(c => c.trim())
}

interface DefaultCreateType {
  'array:file': IAccessibleFile[] | null
  'file': string | null
  'boolean': string | null
  'array:int': string[] | null
  'array:float': string[] | null
  'array:string': string[] | null
  'float': string | null
  'int': string | null
  'string': string | null
}
interface RunType {
  'array:file': IAccessibleFile[] | null
  'file': IAccessibleFile | null
  'boolean': string | null
  'array:int': string[] | null
  'array:float': string[] | null
  'array:string': string[] | null
  'float': string | null
  'int': string | null
  'string': string | null
}
interface ServerType {
  'array:file': string[] | null
  'file': string | null
  'boolean': boolean | null
  'array:int': number[] | null
  'array:float': number[] | null
  'array:string': string[] | null
  'float': number | null
  'int': number | null
  'string': string | null
}

const defaultCreateDefs: { [CLASS_TYPE in IOSpec['class']]: (t: DefaultCreateType[CLASS_TYPE]) => ServerType[CLASS_TYPE] | null } = {
  'array:file': v => v?.length > 0 ? v : null,
  'file': v => v ?? null,
  'boolean': v => v === 'null' ? null : v === 'true',
  'array:int': v => v?.map(i => parseInt(i, 10)) ?? null,
  'array:float': v => v?.map(i => parseFloat(i)) ?? null,
  'array:string': v => v,
  'float': v => parseFloat(v) ?? null,
  'int': v => parseInt(v, 10) ?? null,
  'string': v => String(v) || null,
}

const runDefs: { [CLASS_TYPE in IOSpec['class']]: (t: ServerType[CLASS_TYPE]) => RunType[CLASS_TYPE] | null } = {
  'array:file': v => v?.length > 0 ? v : null,
  'file': v => v ?? null,
  'boolean': v => v == null ? null : v.toString(),
  'array:int': v => v?.map(i => i.toString()) ?? null,
  'array:float': v => v?.map(i => i.toString()) ?? null,
  'array:string': v => v,
  'float': v => v == null ? null : toString(v),
  'int': v => v == null ? null : toString(v),
  'string': v => v || null,
}

export function getDefaultValueFromForm<T extends IOSpec['class']>(sClass: T, val: DefaultCreateType[T]) {
  if(val === '') return null
  return val && defaultCreateDefs[sClass]?.(val)
}
export function getChoicesValueFromForm<T extends IOSpec['class']>(sClass: T, val: string[]) {
  if(sClass === 'array:int' || sClass === 'int') {
    return val &&  val?.map(v => parseInt(v, 10))
  }
  if(sClass === 'array:float' || sClass === 'float') {
    return val &&  val?.map(v => parseFloat(v))
  }
  return val && val
}
export function getDefaultValueFromServer<T extends IOSpec['class']>(sClass: T, val: RunType[T]) {
  return val == null ? null : runDefs[sClass]?.(val)
}

export function mapServerClassToFormClass<T extends IOSpec>(spec: T): T {
  return { ...spec, class: spec.class.replace('array:', '') }
}

function formatFormDefault(val: any, sClass: IOSpec['class']) {
  if(sClass === 'array:file' || sClass === 'file') {
    return val
  }
  return val?.toString() ?? null
}

export function mapFromServerToForm<T extends InputSpec>(spec: T): InputSpecForm {
  return {
    ...spec,
    choices: spec.choices ? spec.choices.toString() : '',
    default: formatFormDefault(spec.default, spec.class),
  }
}

export function removeArrayStringFromClassType(classType: InputSpec['class']) {
  return classType.replace('array:', '')
}

export function handleSnakeNameChange(e: any) {
  e.target.value = stringToSnakeCase(e.target.value)
  return e
}

export function isStrictlyInteger(str: string) {
  return /^\d+$/.test(str)
}

function emptyOrNull(v?: string | null) {
  return v === ''  || v == null
}

function areAllAValuesInB(a: string[], b: string[]): boolean {
  const bSet = new Set(b)
  return a.every(item => bSet.has(item))
}

export function isFloatValid(str: string) {
  return /^-?\d+(?:\.\d+)?$/.test(str)
}
function isIntegerValid(str: string) {
  return Number.isSafeInteger(Number(str))
}
function isValidaArrayOfFloat(strs: string[]) {
  return strs.reduce((acc, value) => acc && isFloatValid(value), true)
}
function isValidaArrayOfInteger(strs: string[]) {
  return strs.reduce((acc, value) => acc && isIntegerValid(value), true)
}

const IOName = Yup.string().required('Name field is required').test(
  'not-start-with-number',
  'The field must not start with a number',
  value => {
    return value ? /^[a-zA-Z_][0-9a-zA-Z_]*$/.test(value) : true
  },
)

export const validationSchema = Yup.object().shape({
  is_new: Yup.boolean().required(),
  forked_from: Yup.string().nullable().optional(),
  name: Yup.string().required('App Name field is required'),
  scope: Yup.string().optional(),
  title: Yup.string().required('App Title field is required'),
  release: Yup.string().required('Release field is required').matches(/^(16\.04|20\.04)$/, 'Invalid version'),
  readme: Yup.string(),
  input_spec: Yup.array().unique('name', 'Name must be unique').of(
    Yup.object().shape({
      class: Yup.string()
        .oneOf(['string', 'file', 'int', 'float', 'boolean', 'array:file', 'array:string', 'array:int', 'array:float'])
        .required('Class field is required'),
      default: Yup.array().when(['class', 'choices'], (classVal: string, choices: string[], schema: Yup.StringSchema) => {
        const containsSchema = schema.test(
          'val-is-not-in-choices',
          'One of the values is not in the choices list',
          value => {
            if(value && choices) {
              return areAllAValuesInB(value, choices)
            }
            return true
          },
        )
        if(classVal === 'array:string') {
          return containsSchema
            .test(
              'is-array-of-string',
              'The field must contain valid comma separated strings',
              value => {
                if (emptyOrNull(value)) return true
                return Array.isArray(value)
              },
            )
            .optional().nullable()
        }
        if(classVal === 'string') return containsSchema.nullable().optional()
        if(classVal === 'boolean') return schema.nullable()
        if(classVal === 'array:file') {
          return schema.nullable().optional()
        }
        if(classVal === 'file') {
          return schema.max(1, 'Must not contain more than one file').nullable().optional()
        }
        if(classVal === 'array:int') {
          return containsSchema
          .test(
            'is-array-of-int',
            'The field must contain a valid comma separated array of integers',
            value => {
              if (emptyOrNull(value)) return true
              return isValidaArrayOfInteger(value)},
            )
            .optional().nullable()
          }
        if(classVal === 'int') {
          return containsSchema.test(
            'is-int',
            'The field must contain an integer',
            value => {
              if(emptyOrNull(value)) return true
              return isIntegerValid(value)
            },
          ).optional().nullable()
        }
        if(classVal === 'array:float') {
          return containsSchema
            .test(
              'is-array-of-float',
              'The field must contain a valid comma separated array of floats',
              value => {
                if(emptyOrNull(value)) return true
                return isValidaArrayOfFloat(value)
              },
            )
            .optional().nullable()
        }
        if(classVal === 'float') {
          return containsSchema.test(
            'is-float',
            'The field must contain a float',
            value => {
              if(emptyOrNull(value)) return true
              return isFloatValid(value)
            },
            ).optional().nullable()
        }
        return schema
      }),
      help: Yup.string().optional(),
      label: Yup.string().optional(),
      name: IOName,
      optional: Yup.boolean().optional(),
      choices: Yup.array().when(['class'], (classVal, schema) => {
        const noArrayStringClass = classVal.replace('array:', '')

        return schema.test(
          'is-csv-of-choices',
          `The field must contain valid comma separated values of ${noArrayStringClass}`,
          (value) => {
            if(noArrayStringClass === 'float') {
              if(emptyOrNull(value)) return true
              return isValidaArrayOfFloat(value)
            }
            if(noArrayStringClass === 'int') {
              if(emptyOrNull(value)) return true
              return isValidaArrayOfInteger(value)
            }
            return true
          },
        ).optional().nullable()
      }),
      requiredRunInput: Yup.boolean().optional(),
    }),
  ),
  output_spec: Yup.array().unique('name', 'Name must be unique').of(
    Yup.object().shape({
      name: IOName,
      label: Yup.string().optional(),
      help: Yup.string().optional(),
    }),
  ),
  internet_access: Yup.boolean().optional(),
  instance_type: Yup.string().required('Instance Type is required'),
  packages: Yup.array().of(Yup.string()).optional(),
  code: Yup.string(),
  ordered_assets: Yup.array().of(Yup.object()).optional(),
})

export function setClassVal(sClass: IOSpec['class'], isArray: boolean) {
  const c = removeArrayStringFromClassType(sClass)
  if(isArray) {
    return `array:${c}` as IOSpec['class']
  }
  return c as IOSpec['class']
}

