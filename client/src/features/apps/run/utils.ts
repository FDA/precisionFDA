import { isSafeInteger, uniq } from 'lodash'
import * as Yup from 'yup'
import { IUser } from '../../../types/user'
import { promiseAllMap } from '../../../utils/promiseAllMap'
import { IAccessibleFile, fetchAccessibleFilesByUID } from '../../databases/databases.api'
import { fetchLicensesForFiles } from '../../licenses/api'
import { License } from '../../licenses/types'
import { RunJobRequest } from '../apps.api'
import {
  AcceptedLicense,
  FormInput,
  IApp,
  InputSpec,
  JobRunForm,
} from '../apps.types'
import { isFloatValid, isStrictlyInteger } from '../form/common'
import { cleanObject } from '../../../utils/object'
import { FileUid } from '../../files/files.types'

export const getLabel = (inputSpec: InputSpec) =>
  inputSpec.label ? inputSpec.label : inputSpec.name

const getSchema = (schema: Yup.BaseSchema, input: InputSpec) => {
  if (input.optional) {
    return schema.optional().nullable()
  }
  return schema.required(`${getLabel(input)} is required`)
}

export const prepareValidations = (
  inputSpec: InputSpec[],
  userJobLimit: IUser['job_limit'],
  scope?: IApp['scope'],
) => {
  const inputs: Record<string, Yup.BaseSchema> = {}
  inputSpec.forEach(i => {
    if (i.class === 'boolean') {
      inputs[i.name] = getSchema(Yup.boolean(), i).nullable()
    }
    if (i.class === 'string') {
      inputs[i.name] = getSchema(Yup.string(), i).nullable()
    }
    if (i.class === 'file') {
      inputs[i.name] = getSchema(Yup.string(), i).nullable()
    }
    if (i.class === 'array:file') {
      inputs[i.name] = getSchema(Yup.array(Yup.string()), i).nullable()
    }
    if (i.class === 'array:string') {
      inputs[i.name] = getSchema(Yup.array(Yup.string()), i)
    }
    if (i.class === 'array:int') {
      inputs[i.name] = getSchema(Yup.array(Yup.number()), i)
    }
    if (i.class === 'array:float') {
      inputs[i.name] = getSchema(Yup.array(Yup.number()), i)
    }
    if (i.class === 'float') {
      inputs[i.name] = getSchema(Yup.string().test(
        'is-float',
        'The field must contain a float',
        value => {
          if (value == null || value === '') return true
          return isFloatValid(value)
        },
      ), i).nullable()
    }
    if (i.class === 'int') {
      inputs[i.name] = getSchema(Yup.string().test(
        'is-int',
        'The field must contain an integer',
        value => {
          if (value == null || value === '') return true
          return isStrictlyInteger(value)
        },
      ).test(
        'is-safe',
        'The field must contain valid safe integer',
        value => {
          if (value == null || value === '') return true
          return isSafeInteger(parseInt(value, 10))
        }), i).nullable()
    }
  })

  const spaceValidations =
    scope && ['private', 'public'].includes(scope)
      ? Yup.object().nullable()
      : Yup.object().nullable().required('Scope is required')

  const validationObject = {
    output_folder_path: Yup.string(),
    jobName: Yup.string().required('Job name required'),
    jobLimit: Yup.number()
      .required('Execution cost limit required')
      .positive('Limit must be positive')
      .typeError('You must specify a number')
      .max(
        userJobLimit,
        `Maximum job limit for current user is $${userJobLimit}`,
      ),
    instanceType: Yup.object().nullable().required('Instance type is required'),
    inputs: Yup.object().shape(inputs),
    scope: spaceValidations,
  }

  return Yup.object().shape(validationObject)
}

export const getValue = (
  inputKey: string,
  value: FormInput,
  inputSpecs: InputSpec[],
): string | string[] | number | number[] | boolean | undefined | null => {
  if(value == null) return null
  const inputClass = inputSpecs.find(
    inputSpec => inputSpec.name === inputKey,
  )?.class
  if (inputClass === 'float') {
    return parseFloat(value as string)
  }
  if (inputClass === 'array:float') {
    return (value as string[]).map((v) => parseFloat(v as string))
  }
  if (inputClass === 'int') {
    return parseInt(value as string, 10)
  }
  if (inputClass === 'array:int') {
    return (value as string[]).map((v) => parseInt(v as string, 10))
  }
  if (inputClass === 'boolean') {
    return value !== 'false'
  }
  return value as string | boolean
}

export function mapInputKeyVals(inputVals: JobRunForm['inputs'], inputSpecs: InputSpec[]) {
  let inputs: { [key: string]: string | string[] | number | boolean | undefined | null } = {}
  
  Object.keys(inputVals).forEach(key => {
    const value = inputVals[key]
    inputs[key] = getValue(key, value, inputSpecs)
  })

  inputs = cleanObject(inputs)

  return inputs
}

export function getFileUIDsFromAppRun(inputVals: JobRunForm['inputs'], inputSpecs: InputSpec[]) {
  const filearr = inputSpecs.filter(s => s.class === 'array:file' || s.class === 'file')
  const uids: string[] | string[][] = []
  
  Object.keys(inputVals).forEach(key => {
    const f = filearr.find(s => s.name === key)
    const value = inputVals[key]
    if(f) { 
      uids.push(value)
    }
  })

  return uniq(uids.flat().filter(i => !!i))
}


export const createRequestObject = (
  vals: JobRunForm,
  app: IApp,
  inputSpecs: InputSpec[],
): RunJobRequest => {
  const inputs = mapInputKeyVals(vals.inputs, inputSpecs)

  return {
    id: app.uid,
    name: vals.jobName,
    job_limit: vals.jobLimit,
    output_folder_path: vals.output_folder_path ?? '',
    instance_type: vals.instanceType?.value,
    scope: vals.scope.value,
    inputs,
  } satisfies RunJobRequest
}

export const getLicensesToAccept = (
  licensesToAccept: License[],
  acceptedLicenses: AcceptedLicense[],
): License[] => {
  const acceptedIds = acceptedLicenses
    .filter(item => item.state === 'active' || item.state === null)
    .map(item => item.license.toString())
  const remainingLicenses = licensesToAccept.filter(
    license => !acceptedIds.includes(license.id.toString()),
  )
  return remainingLicenses
}

export const extractFileUids = (inputs: { [key: string]: FormInput }): FileUid[] => {
  const fileUidsSet = new Set<FileUid>()

  const isFileUid = (input: string): input is FileUid => {
    const parts = input.split('-')
    return parts.length === 3 && parts[0] === 'file' && !Number.isNaN(Number(parts[2]))
  }

  const extractUid = (inputString: string) => {
    if (isFileUid(inputString)) {
      fileUidsSet.add(inputString)
    }
  }

  Object.entries(inputs).forEach(([, value]) => {
    if (typeof value === 'string') {
      extractUid(value)
    } else if (Array.isArray(value)) {
      value.forEach(item => {
        if (typeof item === 'string') {
          extractUid(item)
        }
      })
    }
  })

  return [...fileUidsSet]
}

export const fetchLicensesOnFiles = (inputs: { [key: string]: FormInput }): Promise<License[]> => {
  const uids = extractFileUids(inputs)
  if (uids.length > 0) {
    return fetchLicensesForFiles(uids)
  }
  return Promise.resolve([])
}

export const getBaseLink = (spaceId?: string) => spaceId ? `spaces/${spaceId}` : 'home'
