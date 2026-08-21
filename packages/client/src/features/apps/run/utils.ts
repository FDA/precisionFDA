import { useQuery } from '@tanstack/react-query'
import type React from 'react'
import { useEffect } from 'react'
import type { UseFormSetValue } from 'react-hook-form'
import * as Yup from 'yup'
import { toastError } from '@/components/NotificationCenter/ToastHelper'
import { verifyAccessibleFiles } from '@/features/files/files.api'
import type { IUser } from '@/types/user'
import { cleanObject } from '@/utils/object'
import type { FileUid } from '../../files/files.types'
import type { ServerScope } from '../../home/types'
import { fetchLicensesForFiles } from '../../licenses/api'
import type { License } from '../../licenses/types'
import type { RunWorkflowFormType } from '../../workflows/run/RunWorkflowForm'
import type { RunJobRequest } from '../apps.api'
import type {
  AcceptedLicense,
  BatchInput,
  ComputeInstance,
  FormInput,
  IApp,
  InputSpec,
  RunJobFormType,
  SelectableSpace,
} from '../apps.types'
import { getDefaultValueFromServer, isFloatValid, isStrictlyInteger } from '../form/common'
import { getComputeInstanceSelectionKey, INSTANCE_TYPE_UNAVAILABLE_MESSAGE } from '../instanceTypeAvailability'
import { fetchAndConvertSelectableContexts, fetchAndConvertSelectableSpaces } from './job-run-helper'

export const getLabel = (inputSpec: InputSpec) => (inputSpec.label ? inputSpec.label : inputSpec.name)

/** Mirrors ServerType in ../form/common - the shape values have before the form maps them. */
type ServerShapedValue = string | string[] | number | number[] | boolean | null

/**
 * Builds the run form's input fields from the app spec, preferring prefilled values (re-run,
 * copied link) over the spec defaults. Prefilled values arrive server-shaped - a boolean comes
 * back as JSON `false`, not the 'false' string the form holds - so both go through the same
 * per-class mapping. Keying off inputSpec also keeps fields the spec no longer declares out of
 * the form.
 */
export const buildInputFields = (
  inputSpecs: InputSpec[],
  prefilledFields?: BatchInput['fields'],
): BatchInput['fields'] =>
  Object.fromEntries(
    inputSpecs.map(spec => {
      // hasOwn, not `!== undefined`: input names like 'toString' would otherwise pick up
      // Object.prototype members. An explicit null means the user cleared it, so it stands.
      const value =
        prefilledFields && Object.hasOwn(prefilledFields, spec.name)
          ? (prefilledFields[spec.name] as ServerShapedValue)
          : spec.default
      return [spec.name, getDefaultValueFromServer(spec.class, value)]
    }),
  )

export const getSchema = (schema: Yup.Schema, input: InputSpec) => {
  if (input.optional) {
    return schema.optional().nullable()
  }
  return schema.nullable().required(`${getLabel(input)} is required`)
}

export const prepareValidationsForInputs = (inputSpec: InputSpec[]) => {
  const inputs: Record<string, Yup.Schema> = {}
  inputSpec.forEach(i => {
    if (i.class === 'boolean') {
      inputs[i.name] = getSchema(Yup.boolean(), i)
    }
    if (i.class === 'string') {
      inputs[i.name] = getSchema(Yup.string(), i)
    }
    if (i.class === 'file') {
      // Nullable must come before required so cleared/null values fail required validation reliably.
      inputs[i.name] = i.optional
        ? Yup.string().nullable().optional()
        : Yup.string()
            .nullable()
            .required(`${getLabel(i)} is required`)
    }
    if (i.class === 'array:file') {
      const reqMsg = `${getLabel(i)} is required`
      inputs[i.name] = i.optional
        ? Yup.array(Yup.string()).nullable().optional()
        : Yup.array(Yup.string()).nullable().required(reqMsg).min(1, reqMsg)
    }
    if (i.class === 'array:string') {
      const reqMsg = `${getLabel(i)} is required`
      inputs[i.name] = i.optional
        ? Yup.array(Yup.string()).nullable().optional()
        : Yup.array(Yup.string()).nullable().required(reqMsg).min(1, reqMsg)
    }
    if (i.class === 'array:int') {
      const reqMsg = `${getLabel(i)} is required`
      inputs[i.name] = i.optional
        ? Yup.array(Yup.number()).nullable().optional()
        : Yup.array(Yup.number()).nullable().required(reqMsg).min(1, reqMsg)
    }
    if (i.class === 'array:float') {
      const reqMsg = `${getLabel(i)} is required`
      inputs[i.name] = i.optional
        ? Yup.array(Yup.number()).nullable().optional()
        : Yup.array(Yup.number()).nullable().required(reqMsg).min(1, reqMsg)
    }
    if (i.class === 'float') {
      inputs[i.name] = getSchema(
        Yup.string().test('is-float', 'The field must contain a float', value => {
          if (value == null || value === '') return true
          return isFloatValid(value)
        }),
        i,
      )
    }
    if (i.class === 'int') {
      inputs[i.name] = getSchema(
        Yup.string()
          .test('is-int', 'The field must contain an integer', value => {
            if (value == null || value === '') return true
            return isStrictlyInteger(value)
          })
          .test('is-safe', 'The field must contain valid safe integer', value => {
            if (value == null || value === '') return true
            return Number.isSafeInteger(parseInt(value, 10))
          }),
        i,
      )
    }
  })
  return inputs
}

export const prepareSpaceValidations = (scope?: IApp['scope']) => {
  return scope && ['private', 'public'].includes(scope)
    ? Yup.object().nullable()
    : Yup.object().nullable().required('Scope is required')
}

export const prepareValidations = (
  inputSpec: InputSpec[],
  userJobLimit: IUser['job_limit'],
  scope?: IApp['scope'],
  allowedComputeResourceIds: readonly string[] | null = null,
) => {
  const inputs = prepareValidationsForInputs(inputSpec)
  const spaceValidations = prepareSpaceValidations(scope)

  const batchInputSchema = Yup.object().shape({
    id: Yup.number().optional(),
    instanceType: Yup.mixed()
      .test(
        'required',
        'Instance type is required',
        value => value != null && typeof value === 'object' && 'value' in (value as object),
      )
      .test('allowed-for-account', INSTANCE_TYPE_UNAVAILABLE_MESSAGE, value => {
        if (allowedComputeResourceIds == null) return true
        const key = getComputeInstanceSelectionKey(value)
        if (!key) return true
        return allowedComputeResourceIds.includes(key)
      }),
    fields: Yup.object().shape(inputs),
  })

  const validationObject = {
    outputFolderPath: Yup.string(),
    jobName: Yup.string().required('Job name required'),
    jobLimit: Yup.number()
      .required('Execution cost limit required')
      .positive('Limit must be positive')
      .typeError('You must specify a number')
      .max(userJobLimit, `Maximum job limit for current user is $${userJobLimit}`),
    inputs: Yup.array().of(batchInputSchema).nullable(),
    scope: spaceValidations,
  }

  return Yup.object().shape(validationObject)
}

export const getValue = (inputKey: string, value: FormInput, inputSpecs: InputSpec[]): FormInput | null => {
  if (value == null) return null
  const inputClass = inputSpecs.find(inputSpec => inputSpec.name === inputKey)?.class
  if (inputClass === 'float') {
    return parseFloat(value as string)
  }
  if (inputClass === 'array:float') {
    return (value as string[]).map(v => parseFloat(v as string))
  }
  if (inputClass === 'int') {
    return parseInt(value as string, 10)
  }
  if (inputClass === 'array:int') {
    return (value as string[]).map(v => parseInt(v as string, 10))
  }
  if (inputClass === 'boolean') {
    // Prefilled forms can hold a real boolean, so don't assume the 'true'/'false' strings the buttons set.
    return value === true || value === 'true'
  }
  return value as string | boolean
}

/**
 * Determines whether an input value should be included in the request object.
 * Returns true if the value is not undefined, null, or an empty string.
 *
 * @param value - The input value to check.
 * @returns True if the value should be included, false otherwise.
 */
export const shouldIncludeInputValue = (value: FormInput | null | undefined): value is FormInput => {
  if (value === undefined || value === null) {
    return false
  }

  if (typeof value === 'string') {
    return value !== ''
  }

  return true
}

export function mapInputKeyVals(inputVals: RunJobFormType['inputs'], inputSpecs: InputSpec[]) {
  for (const inputVal of inputVals) {
    let inputs: { [key: string]: FormInput } = {}
    Object.keys(inputVal.fields).forEach(key => {
      const value = getValue(key, inputVal.fields[key], inputSpecs)
      if (shouldIncludeInputValue(value)) {
        inputs[key] = value
      }
    })
    inputs = cleanObject(inputs)

    // Explicitly send null for inputs with defaults that were cleared by the user.
    inputSpecs.forEach(spec => {
      if (spec.default != null && !(spec.name in inputs)) {
        inputs[spec.name] = null
      }
    })

    inputVal.fields = inputs
  }

  return inputVals
}

export function getFileUIDsFromAppRun(inputVals: RunJobFormType['inputs'], inputSpecs: InputSpec[]) {
  const filearr = inputSpecs.filter(s => s.class === 'array:file' || s.class === 'file')

  const uids: string[] = []

  for (const inputVal of inputVals) {
    for (const fileField of filearr) {
      const value = inputVal.fields[fileField.name] as string | string[] | undefined
      if (!value) continue
      if (Array.isArray(value)) {
        uids.push(...value)
      } else {
        uids.push(value)
      }
    }
  }

  return [...new Set(uids)]
}

export const createRequestObject = (
  jobName: string,
  jobLimit: number,
  outputFolderPath: string | null,
  instanceType: string | undefined,
  scope: ServerScope,
  inputsParam: { [key: string]: FormInput },
  app: IApp,
  inputSpecs: InputSpec[],
): RunJobRequest => {
  let inputs: { [key: string]: string | string[] | number | number[] | boolean | undefined | null | ComputeInstance } =
    {}

  Object.keys(inputsParam).forEach(key => {
    const value = getValue(key, inputsParam[key], inputSpecs)
    if (shouldIncludeInputValue(value)) {
      inputs[key] = value
    }
  })

  inputs = cleanObject(inputs)

  // Explicitly send null for inputs with defaults that were cleared by the user.
  // This tells the backend that the user intentionally cleared the input,
  // rather than it being absent from the form.
  inputSpecs.forEach(spec => {
    if (spec.default != null && !(spec.name in inputs)) {
      inputs[spec.name] = null
    }
  })

  return {
    appUid: app.uid,
    name: jobName,
    jobLimit,
    outputFolderPath: outputFolderPath ?? '',
    instanceType: instanceType ?? '',
    scope,
    inputs,
  } satisfies RunJobRequest
}

export const getLicensesToAccept = (licensesToAccept: License[], acceptedLicenses: AcceptedLicense[]): License[] => {
  const acceptedIds = acceptedLicenses
    .filter(item => item.state === 'active' || item.state === null)
    .map(item => item.license.toString())
  return licensesToAccept.filter(license => !acceptedIds.includes(license.id.toString()))
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

export const fetchLicensesOnFiles = (uids: FileUid[]): Promise<License[]> => {
  if (uids.length > 0) {
    return fetchLicensesForFiles(uids)
  }
  return Promise.resolve([])
}

export const useSelectableContexts = (appScope: ServerScope, entityType: string) => {
  return useQuery({
    queryKey: ['selectable-contexts', appScope],
    queryFn: () =>
      fetchAndConvertSelectableContexts(entityType).catch(e => {
        toastError('Error loading contexts')
        throw e
      }),
  })
}

export const useSelectableSpaces = (appScope: ServerScope) => {
  return useQuery({
    queryKey: ['selectable-spaces', appScope],
    queryFn: () =>
      fetchAndConvertSelectableSpaces(appScope).catch(e => {
        toastError('Error loading spaces')
        throw e
      }),
  })
}

export const useDefaultScopeSelection = (
  formValues: RunJobFormType | RunWorkflowFormType,
  selectableSpaces: SelectableSpace[] | undefined,
  currentScope: ServerScope,
  setValue: UseFormSetValue<RunJobFormType>,
) => {
  useEffect(() => {
    if (formValues.scope || !selectableSpaces) {
      return
    }

    const defaultSelectedScope = selectableSpaces.find(space => space.value === currentScope) ?? {
      label: 'Private',
      value: 'private',
    }
    setValue('scope', defaultSelectedScope)
  }, [selectableSpaces, currentScope, setValue])
}

export const exportFormData = (event: React.MouseEvent<HTMLButtonElement>, formData: RunJobFormType) => {
  event.preventDefault()
  event.stopPropagation()

  const dataToExport = JSON.parse(JSON.stringify(formData))
  delete dataToExport.scope

  if (dataToExport.inputs && Array.isArray(dataToExport.inputs)) {
    dataToExport.inputs.forEach((item: BatchInput) => delete item.id)
  }
  const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport))}`
  const downloadAnchorNode = document.createElement('a')
  downloadAnchorNode.setAttribute('href', dataStr)
  downloadAnchorNode.setAttribute('download', 'form_data.json')
  document.body.appendChild(downloadAnchorNode)
  downloadAnchorNode.click()
  downloadAnchorNode.remove()
}

export const validateFiles = async (fileUids: string[]) => {
  // No file uids to check (e.g. an app with no file inputs) — avoid calling the
  // accessibility endpoint with an empty array, which axios drops from the query
  // string entirely, causing the server to reject the request as a missing `uids`.
  if (fileUids.length === 0) {
    return {} as Record<string, boolean>
  }
  const { valid, invalid } = await verifyAccessibleFiles(fileUids)
  const validateFilesResult: Record<string, boolean> = {}
  for (const uid of valid) {
    validateFilesResult[uid] = true
  }
  for (const uid of invalid) {
    validateFilesResult[uid] = false
  }
  return validateFilesResult
}

export const collectFileUidsFromBatchInput = (batchInput: BatchInput): FileUid[] => {
  const fileUids: FileUid[] = []

  const traverse = (value: FormInput) => {
    if (typeof value === 'string' && value.startsWith('file-')) {
      fileUids.push(value as FileUid)
    } else if (Array.isArray(value)) {
      value.forEach(item => traverse(item))
    } else if (typeof value === 'object' && value !== null) {
      if (!Array.isArray(value) && !(value instanceof Date) && !(value instanceof File)) {
        Object.values(value).forEach(subValue => traverse(subValue as FormInput))
      }
    }
  }

  if (batchInput.fields) {
    Object.values(batchInput.fields).forEach(value => traverse(value))
  }

  return fileUids
}

export const extractFileUidsFromBatchInputs = (batchInputs: BatchInput[]): FileUid[] => {
  const allFileUidsSet = new Set<FileUid>()

  batchInputs.forEach(batchInput => {
    const fileUids = collectFileUidsFromBatchInput(batchInput)
    fileUids.forEach(fileUid => allFileUidsSet.add(fileUid))
  })

  return Array.from(allFileUidsSet)
}

export const getBaseLink = (spaceId?: number | string) => (spaceId ? `spaces/${spaceId}` : 'home')

export const generateCopyUrl = (displayData: string, url: string, app: IApp, copyType: 'app' | 'appSeries'): string => {
  const base64Encoded = btoa(encodeURIComponent(displayData))
  const newAppUrl = url.replace(/app-[^/]+/, copyType === 'app' ? app.uid : `app-series-${app.appSeriesId.toString()}`)

  return `${newAppUrl}#${base64Encoded}`
}
