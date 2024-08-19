import { useQuery } from '@tanstack/react-query'
import { isSafeInteger, uniq } from 'lodash'
import React, { useEffect } from 'react'
import { UseFormSetValue } from 'react-hook-form'
import { toast } from 'react-toastify'
import * as Yup from 'yup'
import { IUser } from '../../../types/user'
import { cleanObject } from '../../../utils/object'
import { FileUid } from '../../files/files.types'
import { ServerScope } from '../../home/types'
import { fetchLicensesForFiles } from '../../licenses/api'
import { License } from '../../licenses/types'
import { fetchUserComputeInstances, RunJobRequest } from '../apps.api'
import {
  AcceptedLicense,
  BatchInput,
  ComputeInstance,
  FormInput,
  IApp,
  InputSpec,
  RunJobFormType,
  SelectableSpace,
} from '../apps.types'
import { isFloatValid, isStrictlyInteger } from '../form/common'
import { fetchAndConvertSelectableContexts, fetchAndConvertSelectableSpaces } from './job-run-helper'
import { RunWorkflowFormType } from '../../workflows/run/RunWorkflowForm'

export const getLabel = (inputSpec: InputSpec) => (inputSpec.label ? inputSpec.label : inputSpec.name)

export const getSchema = (schema: Yup.BaseSchema, input: InputSpec) => {
  if (input.optional) {
    return schema.optional().nullable()
  }
  return schema.required(`${getLabel(input)} is required`)
}

export const prepareValidationsForInputs = (inputSpec: InputSpec[]) => {
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
      inputs[i.name] = getSchema(
        Yup.string().test('is-float', 'The field must contain a float', value => {
          if (value == null || value === '') return true
          return isFloatValid(value)
        }),
        i,
      ).nullable()
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
            return isSafeInteger(parseInt(value, 10))
          }),
        i,
      ).nullable()
    }
  })
  return inputs
}

export const prepareSpaceValidations = (scope?: IApp['scope']) => {
  return scope && ['private', 'public'].includes(scope)
    ? Yup.object().nullable()
    : Yup.object().nullable().required('Scope is required')
}

export const prepareValidations = (inputSpec: InputSpec[], userJobLimit: IUser['job_limit'], scope?: IApp['scope']) => {
  const inputs = prepareValidationsForInputs(inputSpec)
  const spaceValidations = prepareSpaceValidations(scope)

  const batchInputSchema = Yup.object().shape({
    id: Yup.number().optional(),
    instanceType: Yup.object().nullable().required('Instance type is required'),
    fields: Yup.object().shape(inputs),
  })

  const validationObject = {
    output_folder_path: Yup.string(),
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
    return value !== 'false'
  }
  return value as string | boolean
}

export function mapInputKeyVals(inputVals: RunJobFormType['inputs'], inputSpecs: InputSpec[]) {
  for (const inputVal of inputVals) {
    let inputs: { [key: string]: FormInput } = {}
    Object.keys(inputVal.fields).forEach(key => {
      const value = inputVal.fields[key]
      inputs[key] = getValue(key, value, inputSpecs) as FormInput
    })
    inputs = cleanObject(inputs)
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

  return uniq(uids)
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
  let inputs: { [key: string]: string | string[] | number | number[] | boolean | undefined | null } = {}

  Object.keys(inputsParam).forEach(key => {
    const value = inputsParam[key]
    inputs[key] = getValue(key, value, inputSpecs)
  })

  inputs = cleanObject(inputs)

  return {
    id: app.uid,
    name: jobName,
    job_limit: jobLimit,
    output_folder_path: outputFolderPath ?? '',
    instance_type: instanceType ?? '',
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
        toast.error('Error loading contexts')
        throw e
      }),
  })
}

export const useUserComputeInstances = () => {
  return useQuery({
    queryKey: ['user-compute-instances'],
    queryFn: () =>
      fetchUserComputeInstances().catch(e => {
        toast.error('Error loading compute instances')
        throw e
      }),
  })
}

export const useSelectableSpaces = (appScope: ServerScope) => {
  return useQuery({
    queryKey: ['selectable-spaces', appScope],
    queryFn: () =>
      fetchAndConvertSelectableSpaces(appScope).catch(e => {
        toast.error('Error loading spaces')
        throw e
      }),
  })
}

export const useDefaultInstanceType = (
  formValues: RunJobFormType,
  computeInstances: ComputeInstance[] | undefined,
  instanceType: string,
  setValue: UseFormSetValue<RunJobFormType>,
) => {
  useEffect(() => {
    if (formValues?.inputs?.[0]?.instanceType || !computeInstances) {
      return
    }

    setValue('inputs.0.instanceType', computeInstances.find(instance => instance.value === instanceType) ?? computeInstances[0])
  }, [computeInstances, instanceType, setValue])
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

export const importFormData = (event: React.ChangeEvent<HTMLInputElement>, setVals: (val: RunJobFormType) => void) => {
  event.preventDefault()
  const fileReader = new FileReader()

  if (event.target.files && event.target.files.length > 0) {
    const file = event.target.files[0]

    fileReader.readAsText(file, 'UTF-8')
    fileReader.onload = e => {
      const content = e.target?.result

      if (typeof content === 'string') {
        try {
          const importedData = JSON.parse(content)

          if (importedData.inputs && Array.isArray(importedData.inputs)) {
            importedData.inputs = importedData.inputs.map((item: BatchInput, index: number) => ({
              ...item,
              id: index + 1,
            }))
          }

          setVals(importedData)
        } catch (error) {
          console.log(error)
          toast.error('Invalid file format')
        }
      }
    }
  }
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
  let allFileUids: FileUid[] = []

  batchInputs.forEach(batchInput => {
    const fileUids = collectFileUidsFromBatchInput(batchInput)
    allFileUids = [...allFileUids, ...fileUids]
  })

  return allFileUids
}

export const getBaseLink = (spaceId?: number) => (spaceId ? `spaces/${spaceId}` : 'home')
