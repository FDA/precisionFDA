import { isSafeInteger } from 'lodash'
import * as Yup from 'yup'
import { IUser } from '../../../../types/user'
import { promiseAllMap } from '../../../../utils/promiseAllMap'
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
import { cleanObject } from '../../../../utils/object'

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
    return value === 'false' ? false : true
  }
  return value as string | boolean
}


export const createRequestObject = (
  vals: JobRunForm,
  app: IApp,
  inputSpecs: InputSpec[],
): RunJobRequest => {
  let inputs: { [key: string]: string | string[] | number | boolean | undefined | null } = {}
  
  Object.keys(vals.inputs).forEach(key => {
    const value = vals.inputs[key]
    inputs[key] = getValue(key, value, inputSpecs)
  })

  inputs = cleanObject(inputs)

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

function getAllIOSpecFiles(inputs: JobRunForm['inputs']) {
  let ids: IAccessibleFile[] = []

  Object.keys(inputs).forEach(key => {
    const i = inputs[key]
    if (!i) return
    if (Array.isArray(i) && typeof i[0] === 'object') {
      i.forEach(k => {
        ids.push(k as IAccessibleFile)
      })
    }
    if (typeof i === 'object') {
      ids.push(i as IAccessibleFile)
    }
  })

  ids = ids.filter(k => !!k)
  return ids
}

export const fetchLicensesOnFiles = (inputs: JobRunForm['inputs']): Promise<License[]> => {
  const ids = getAllIOSpecFiles(inputs).map(i => i.id)
  if (ids.length > 0) {
    return fetchLicensesForFiles(ids)
  }
  return Promise.resolve([])
}

export async function fetchDefaultFiles(
  input_spec: InputSpec[],
) {
  const promiseMap: Record<string, Promise<IAccessibleFile | IAccessibleFile[]>> = {}

  input_spec.forEach((input, index) => {
    if (input.class === 'file' && input?.default) {
      promiseMap[index] = fetchAccessibleFilesByUID({ uid: input.default }).then(f => f[0])
    }
    if (input.class === 'array:file' && input?.default) {
      promiseMap[index] = fetchAccessibleFilesByUID({ uid: input.default })
    }
  })
  return promiseAllMap(promiseMap)
}

export const getBaseLink = (spaceId?: string) => spaceId ? `spaces/${spaceId}` : 'home'
