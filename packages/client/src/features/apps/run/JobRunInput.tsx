import { useQuery } from '@tanstack/react-query'
import { isSafeInteger } from 'lodash'
import { useEffect } from 'react'
import {
  type ControllerRenderProps,
  type FieldErrors,
  type FieldPath,
  type FieldValues,
  type UseFormRegister,
  type UseFormSetError,
  useFormContext,
} from 'react-hook-form'
import { components, type SingleValueProps } from 'react-select'
import { BoolButton, BoolButtonGroup } from '@/components/Button/BoolButtons'
import { FieldInfo } from '@/components/form/FieldInfo'
import { InputText } from '@/components/InputText'
import { CreatableSelect, Select } from '@/components/Select'
import { FieldError } from '@/components/ui/field'
import type { RunWorkflowFormType } from '@/features/workflows/run/RunWorkflowForm'
import { noAccessText } from '../../files/file.utils'
import type { InputSpec, IOSpec, RunJobFormType } from '../apps.types'
import { isFloatValid, isStrictlyInteger } from '../form/common'
import { SelectMultiFileInput } from '../SelectMultiFileInput'
import { ErrorMessageForField } from './ErrorMessageForField'
import { validateFile } from './utils'

const getDefaultValue = val => {
  if (val === null || val === undefined || val.length === 0) return undefined
  return Array.isArray(val) ? val.map(value => ({ value, label: value })) : { value: val, label: val }
}

const Msg = ({
  sclass,
  inputValue,
  value,
}: {
  inputValue: string
  value: { label: string; value: string }[]
  sclass: IOSpec['class']
}) => {
  const allVals = value?.map(v => v.value) ?? []
  const isDuplicate = allVals.includes(inputValue)
  let err = null
  switch (sclass) {
    case 'array:float':
      if (inputValue && !isFloatValid(inputValue)) {
        err = 'The value provided must be of type float'
      }
      break
    case 'array:int':
      if (inputValue && !isStrictlyInteger(inputValue)) {
        err = 'The value provided must be of type int'
      }
      break
    default:
      break
  }
  if (!err) {
    if (isDuplicate) {
      return <span>The current value is already provided in the list</span>
    }
    if (inputValue.length > 0) {
      return <span>Press enter to add value</span>
    }
    return <span>Type to add new value</span>
  }
  return <span>{err}</span>
}

const Menu = ({ children, ...props }: SingleValueProps) => {
  const sclass = props.selectProps.sclass as IOSpec['class']
  const { inputValue, value } = props.selectProps

  return (
    <components.Menu {...props}>
      <div className="flex gap-4 p-2">
        <Msg inputValue={inputValue} value={value} sclass={sclass} />
      </div>
    </components.Menu>
  )
}

/**
 * Private apps need to be able to run with public files and public apps
 * need to be able to run with private files.
 *
 * @param scope
 */
const enhanceScope = (scope: string) => {
  return ['public', 'private'].includes(scope) ? ['private', 'public'] : [scope, 'public']
}

/** Reads validation for this path via RHF context (works for nested paths like inputs.0.fields.x). Requires FormProvider. */
function FileFieldMessage({ name }: { name: FieldPath<FieldValues> }) {
  const { getFieldState, formState } = useFormContext<FieldValues>()
  const { error } = getFieldState(name, formState)
  return error?.message ? <FieldError>{error.message}</FieldError> : null
}

const ArrayFileInput = ({
  disabled,
  field,
  scope,
  inputSpec,
  setError,
  validatedFilesCache,
}: {
  inputSpec: InputSpec
  field: ControllerRenderProps<RunJobFormType, any>
  setError: UseFormSetError<RunJobFormType>
  disabled: boolean
  scope: string
  validatedFilesCache: Record<string, boolean>
}) => {
  const { setValue } = useFormContext<FieldValues>()
  const fileUids: string[] = field?.value || []
  const areAllFilesPreValidated = fileUids.every(fileUid => validatedFilesCache[fileUid])

  const fileListQuery = useQuery({
    queryFn: () => Promise.all(fileUids.map(uid => validateFile(uid))),
    queryKey: ['user-list-files', fileUids],
    enabled: fileUids.length > 0 && !areAllFilesPreValidated,
  })

  const allFilesValidated = fileListQuery?.data?.every((isValid: boolean) => isValid) ?? false
  const error = fileUids.length > 0 && !areAllFilesPreValidated && fileListQuery.isSuccess && !allFilesValidated

  useEffect(() => {
    if (error) {
      setError(field.name, { type: 'custom', message: noAccessText.multi })
    }
  }, [error, setError, field.name])

  return (
    <>
      <SelectMultiFileInput
        dialogType="checkbox"
        dialogTitle="Select input files"
        disabled={disabled}
        onChange={value => {
          setValue(field.name as FieldPath<FieldValues>, value?.map(v => v.uid) ?? null, {
            shouldValidate: true,
            shouldTouch: true,
          })
        }}
        value={field?.value ?? null}
        scopes={enhanceScope(scope)}
      />

      <FieldInfo text={inputSpec.help} />
      <FileFieldMessage name={field.name as FieldPath<FieldValues>} />
    </>
  )
}

const SingleFileInput = ({
  disabled,
  field,
  scope,
  inputSpec,
  setError,
  validatedFilesCache,
}: {
  inputSpec: InputSpec
  field: ControllerRenderProps<RunJobFormType, any>
  setError: UseFormSetError<RunJobFormType>
  disabled: boolean
  scope: string
  validatedFilesCache: Record<string, boolean>
}) => {
  const { setValue } = useFormContext<FieldValues>()
  const fileUid = field?.value
  const hasValue = !!fileUid && fileUid.length > 0
  const isSuccessfullyPreValidated = validatedFilesCache[fileUid]

  const fileListQuery = useQuery({
    queryFn: () => validateFile(fileUid),
    queryKey: ['user-list-files', fileUid],
    enabled: !!fileUid && fileUid.length > 0 && !isSuccessfullyPreValidated,
  })

  const error = hasValue && fileListQuery.isSuccess && !(isSuccessfullyPreValidated || fileListQuery?.data === true)

  useEffect(() => {
    if (error) {
      setError(field.name, { type: 'custom', message: noAccessText.single })
    }
  }, [error, setError, field.name])

  return (
    <>
      <SelectMultiFileInput
        dialogTitle="Select input file"
        disabled={disabled}
        onChange={value => {
          setValue(field.name as FieldPath<FieldValues>, value?.[0].uid ?? null, {
            shouldValidate: true,
            shouldTouch: true,
          })
        }}
        dialogType="radio"
        value={field.value && [field.value]}
        scopes={enhanceScope(scope)}
      />

      <FieldInfo text={inputSpec.help} />
      <FileFieldMessage name={field.name as FieldPath<FieldValues>} />
    </>
  )
}

export const JobRunInput = ({
  inputSpec,
  field,
  errors,
  disabled,
  register,
  scope,
  setError,
  validatedFilesCache,
}: {
  inputSpec: InputSpec
  field: ControllerRenderProps<RunJobFormType, any>
  errors: FieldErrors<Record<string, unknown>>
  disabled: boolean
  register: UseFormRegister<RunJobFormType> | UseFormRegister<RunWorkflowFormType>
  setError: UseFormSetError<RunJobFormType>
  scope: string
  validatedFilesCache?: Record<string, boolean>
}) => {
  const choices = Array.isArray(inputSpec?.choices) ? inputSpec.choices : null

  const InputSelect = choices ? Select : CreatableSelect

  switch (inputSpec.class) {
    case 'file': {
      return (
        <SingleFileInput
          setError={setError}
          disabled={disabled}
          field={field}
          inputSpec={inputSpec}
          scope={scope}
          validatedFilesCache={validatedFilesCache || {}}
        />
      )
    }
    case 'array:file': {
      return (
        <ArrayFileInput
          setError={setError}
          disabled={disabled}
          field={field}
          inputSpec={inputSpec}
          scope={scope}
          validatedFilesCache={validatedFilesCache || {}}
        />
      )
    }
    case 'string': {
      return (
        <>
          {choices ? (
            <InputSelect
              defaultValue={getDefaultValue(field.value)}
              isDisabled={disabled}
              isMulti={false}
              onBlur={field.onBlur}
              options={choices?.map(value => ({ value, label: value }))}
              onChange={val => {
                field.onBlur()
                field.onChange(val?.value)
              }}
            />
          ) : (
            <InputText type="text" disabled={disabled} {...register(field.name)} />
          )}
          <FieldInfo text={inputSpec.help} />
          <ErrorMessageForField errors={errors} fieldName={field.name} />
        </>
      )
    }
    case 'array:string': {
      return (
        <>
          <InputSelect
            defaultValue={getDefaultValue(field.value)}
            isDisabled={disabled}
            isMulti
            onBlur={field.onBlur}
            sclass={inputSpec.class}
            components={!choices ? { Menu } : undefined}
            options={choices?.map(value => ({ value, label: value }))}
            onChange={val => {
              field.onBlur()
              field.onChange(val.map(v => v.value))
            }}
          />
          <FieldInfo text={inputSpec.help} />
          <ErrorMessageForField errors={errors} fieldName={field.name} />
        </>
      )
    }
    case 'int': {
      return (
        <>
          {choices ? (
            <InputSelect
              defaultValue={getDefaultValue(field.value)}
              isDisabled={disabled}
              isMulti={false}
              onBlur={field.onBlur}
              options={choices?.map(value => ({ value, label: value }))}
              onChange={val => {
                field.onBlur()
                field.onChange(val?.value)
              }}
            />
          ) : (
            <InputText type="text" disabled={disabled} {...register(field.name)} />
          )}
          <FieldInfo text={inputSpec.help} />
          <ErrorMessageForField errors={errors} fieldName={field.name} />
        </>
      )
    }
    case 'array:int': {
      return (
        <>
          <InputSelect
            value={getDefaultValue(field.value)}
            isDisabled={disabled}
            isValidNewOption={n => isSafeInteger(parseInt(n, 10))}
            isMulti
            options={choices?.map(value => ({
              value: `${value}`,
              label: `${value}`,
            }))}
            sclass={inputSpec.class}
            components={!choices ? { Menu } : undefined}
            onBlur={field.onBlur}
            onChange={val => {
              field.onBlur()
              field.onChange(val.map(v => v.value))
            }}
          />
          <FieldInfo text={inputSpec.help} />
          <ErrorMessageForField errors={errors} fieldName={field.name} />
        </>
      )
    }
    case 'float': {
      return (
        <>
          {choices ? (
            <InputSelect
              defaultValue={getDefaultValue(field.value)}
              isDisabled={disabled}
              isMulti={false}
              onBlur={field.onBlur}
              options={choices?.map(value => ({ value, label: value }))}
              onChange={val => {
                field.onBlur()
                field.onChange(val?.value)
              }}
            />
          ) : (
            <InputText type="text" disabled={disabled} {...register(field.name)} />
          )}
          <FieldInfo text={inputSpec.help} />
          <ErrorMessageForField errors={errors} fieldName={field.name} />
        </>
      )
    }
    case 'array:float': {
      return (
        <>
          <InputSelect
            defaultValue={getDefaultValue(field.value)}
            isDisabled={disabled}
            isValidNewOption={n => isFloatValid(n)}
            isMulti
            options={choices?.map(value => ({
              value: `${value}`,
              label: `${value}`,
            }))}
            onBlur={field.onBlur}
            onChange={val => {
              field.onBlur()
              field.onChange(val.map(v => v.value))
            }}
            sclass={inputSpec.class}
            components={!choices ? { Menu } : undefined}
          />
          <FieldInfo text={inputSpec.help} />
          <ErrorMessageForField errors={errors} fieldName={field.name} />
        </>
      )
    }
    case 'boolean': {
      const val = field.value?.toString()
      return (
        <>
          <BoolButtonGroup>
            <BoolButton
              type="button"
              data-selected={(val === 'true').toString() as BooleanString}
              onClick={() => {
                field.onChange(val === 'true' ? null : 'true')
                field.onBlur()
              }}
            >
              True
            </BoolButton>

            <BoolButton
              type="button"
              data-selected={(val === 'false').toString() as BooleanString}
              onClick={() => {
                field.onChange(val === 'false' ? null : 'false')
                field.onBlur()
              }}
            >
              False
            </BoolButton>
          </BoolButtonGroup>
          <FieldInfo text={inputSpec.help} />
          <ErrorMessageForField errors={errors} fieldName={field.name} />
        </>
      )
    }
    default: {
      return <div>`ERROR: Unknown type of input class ${inputSpec.class}`</div>
    }
  }
}
