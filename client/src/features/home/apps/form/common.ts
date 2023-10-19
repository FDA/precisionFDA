/* eslint-disable func-names */
import * as Yup from 'yup'
import { isBoolean, toString } from 'lodash'
import { IOSpec, InputSpec } from '../apps.types'
import { csvToArray } from '../../../../utils/csvToArray'
import { stringToSnakeCase } from '../../../../utils/stringToSnakeCase'
import { IAccessibleFile } from '../../databases/databases.api'

export const formatStringToArray = (csvVal: string | null) => {
  if(csvVal === null || csvVal.length === 0) {
    return null
  }
  return csvToArray(csvVal)[0].map(c => c.trim())
}

interface CreateType {
  'array:file': IAccessibleFile[] | null
  'file': string | null
  'boolean': string | null
  'array:int': string | null
  'array:float': string | null
  'array:string': string | null
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

const createDefs: { [CLASS_TYPE in IOSpec['class']]: (t: CreateType[CLASS_TYPE]) => ServerType[CLASS_TYPE] | null } = {
  'array:file': v => v?.length > 0 ? v : null,
  'file': v => v ?? null,
  'boolean': v => v === 'null' ? null : v === 'true',
  'array:int': v => formatStringToArray(v)?.map(i => parseInt(i, 10)) ?? null,
  'array:float': v => formatStringToArray(v)?.map(i => parseFloat(i)) ?? null,
  'array:string': v => formatStringToArray(v),
  'float': v => parseFloat(v) ?? null,
  'int': v => parseInt(v, 10) ?? null,
  'string': v => v || null,
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

export function getDefaultValueFromForm<T extends IOSpec['class']>(sClass: T, val: CreateType[T]) {
  if(val === '') return null
  return val && createDefs[sClass]?.(val)
}
export function getChoicesValueFromForm<T extends IOSpec['class']>(sClass: T, val: string) {
  if(sClass === 'array:int' || sClass === 'int') {
    return val &&  formatStringToArray(val)?.map(v => parseInt(v, 10))
  }
  if(sClass === 'array:float' || sClass === 'float') {
    return val &&  formatStringToArray(val)?.map(v => parseFloat(v))
  }
  return val && formatStringToArray(val)
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

export function mapFromServerToForm<T extends InputSpec>(spec: T): T {
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

const csvIntRegex = /^(?:[-+]?\d+)(?:,(?:[-+]?\d+))*$/

function isValidArrayOfInts(str: string) {
  return csvIntRegex.test(str)
}

function isValidArrayOfStrings(str: string) {
  try {
    const parsedArray = JSON.parse(`[${str}]`)
    if (!Array.isArray(parsedArray)) {
      return false
    }

    return parsedArray.every(element => typeof element === 'string')
  } catch (error) {
    return false
  }
}
const csvFloatRegex = /^(?:[-+]?\d*\.\d+|\d+)(?:,(?:[-+]?\d*\.\d+|\d+))*$/

function isValidArrayOfFloats(str: string) {
  return csvFloatRegex.test(str)
}

export function isStrictlyInteger(str: string) {
  return /^\d+$/.test(str)
}

export function isFloatValid(str: string) {
  return /^-?\d+(?:\.\d+)?$/.test(str)
}

function isValidCSVString(str: string) {
  return /^[a-z0-9]+(?:, ?[a-z0-9]+)*$/.test(str)
}

function emptyOrNull(v?: string | null) {
  return v === ''  || v == null
}

/**
 * Adds a custom validation method to the Yup library for arrays, allowing checking for unique values based on a specified field.
 *
 * @param {string} field - The field within each object in the array to be used for uniqueness comparison.
 * @param {string} message - The error message to be displayed if the validation fails.
 * @returns {Yup.Schema} - The updated Yup schema with the 'unique' validation method applied.
 */
Yup.addMethod(Yup.array, 'unique', function (field, message) {
  return this.test('unique', message, function (array: any) {
    const uniqueData = Array.from(
      new Set(array.map((row) => row[field]?.toLowerCase())),
    )
    const isUnique = array.length === uniqueData.length
    if (isUnique) {
      return true
    }
    const index = array.findIndex(
      (row, i) => row[field]?.toLowerCase() !== uniqueData[i],
    )
    if (array[index][field] === '') {
      return true
    }
    return this.createError({
      path: `${this.path}.${index}.${field}`,
      message,
    })
  })
})

function areAllValuesInB(a: string[], b: string[]): boolean {
  const bSet = new Set(b)
  return a.every(item => bSet.has(item))
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
  release: Yup.string().required('Release field is required'),
  readme: Yup.string(),
  input_spec: Yup.array().unique('name', 'Name must be unique').of(
    Yup.object().shape({
      class: Yup.string()
        .oneOf(['string', 'file', 'int', 'float', 'boolean', 'array:file', 'array:string', 'array:int', 'array:float'])
        .required('Class field is required'),
      default: Yup.string().when(['class', 'choices'], (classVal: string, choices: string[], schema: Yup.StringSchema) => {
        if(classVal === 'array:string') {
          return Yup.string()
            .test(
              'is-array-of-string',
              'The field must contain valid comma separated strings',
              value => {
                return value ? isValidCSVString(value) : true
              },
            )
            .test(
              'val-is-not-in-choices',
              'One of the values is not in the choices list',
              value => {
                if(value && choices) {
                  return areAllValuesInB(formatStringToArray(value), formatStringToArray(choices))
                }
                return true
              },
            )
            .optional().nullable()
        }
        if(classVal === 'string') return Yup.string().nullable()
        if(classVal === 'boolean') return Yup.string().nullable()
        if(classVal === 'array:file') {
          return Yup.array(Yup.string()).nullable().optional()
        }
        if(classVal === 'file') {
          return Yup.array(Yup.string()).max(1, 'Must not contain more than one file').nullable().optional()
        }
        if(classVal === 'array:int') {
          return Yup.string()
          .test(
            'is-array-of-int',
            'The field must contain a valid comma separated array of integers',
            value => {
              if (emptyOrNull(value)) return true
              return isValidArrayOfInts(value)},
            )
            .test(
              'val-is-not-in-choices',
              'One of the values is not in the choices list',
              value => {
                if(value && choices) {
                  return areAllValuesInB(formatStringToArray(value), formatStringToArray(choices))
                }
                return true
              },
            )
            .optional().nullable()
          }
        if(classVal === 'int') {
          return Yup.string().optional().test(
            'is-int',
            'The field must contain an integer',
            value => {
              if(emptyOrNull(value)) return true
              return isStrictlyInteger(value)
            },
          ).optional().nullable()
        }
        if(classVal === 'array:float') {
          return Yup.string()
            .test(
              'is-array-of-float',
              'The field must contain a valid comma separated array of floats',
              value => {
                if(emptyOrNull(value)) return true
                return isValidArrayOfFloats(value)
              },
            )
            .test(
              'val-is-not-in-choices',
              'One of the values is not in the choices list',
              value => {
                if(value && choices) {
                  return areAllValuesInB(formatStringToArray(value), formatStringToArray(choices))
                }
                return true
              },
            )
            .optional().nullable()
        }
        if(classVal === 'float') {
          return Yup.string().test(
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
      choices: Yup.string().when(['class'], (classVal, schema) => {
        const noArrayStringClass = classVal.replace('array:', '')
        return schema.test(
          'is-csv-of-choices',
          `The field must contain valid comma separated ${noArrayStringClass}`,
          (value) => {
            if(noArrayStringClass === 'float') {
              if(emptyOrNull(value)) return true
              return isValidArrayOfFloats(value)
            }
            if(noArrayStringClass === 'int') {
              if(emptyOrNull(value)) return true
              return isValidArrayOfInts(value)
            }
            return value ? isValidCSVString(value) : true
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

