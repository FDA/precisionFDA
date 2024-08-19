import { isSafeInteger } from 'lodash'
import React, { useEffect } from 'react'
import { ControllerRenderProps, FieldErrors, UseFormRegister, UseFormSetError } from 'react-hook-form'
import Select, { SingleValueProps, components } from 'react-select'
import CreatableSelect from 'react-select/creatable'
import styled from 'styled-components'
import { BoolButton, BoolButtonGroup } from '../../../components/Button/BoolButtons'
import { InputText } from '../../../components/InputText'
import { FieldInfo } from '../../../components/form/FieldInfo'
import { noAccessText } from '../../files/file.utils'
import { useFetchFilesByUIDQuery } from '../../files/query/useFetchFilesByUIDQuery'
import { SelectMultiFileInput } from '../SelectMultiFileInput'
import { IOSpec, InputSpec, RunJobFormType } from '../apps.types'
import { isFloatValid, isStrictlyInteger } from '../form/common'
import { ErrorMessageForField } from './ErrorMessageForField'

const getDefaultValue = val => {
  if (val === null || val === undefined || val.length === 0) return undefined
  return Array.isArray(val) ? val.map(value => ({ value, label: value })) : { value: val, label: val }
}

const StyledMenuMessage = styled.div`
  padding: 8px;
  display: flex;
  gap: 16px;
`

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
      <StyledMenuMessage>
        <Msg inputValue={inputValue} value={value} sclass={sclass} />
      </StyledMenuMessage>
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

const ArrayFileInput = ({
  disabled,
  field,
  scope,
  inputSpec,
  errors,
  setError,
}: {
  inputSpec: InputSpec
  field: ControllerRenderProps<RunJobFormType, any>
  errors: FieldErrors<Record<string, unknown>>
  setError: UseFormSetError<RunJobFormType>
  disabled: boolean
  scope: string
}) => {
  const fileListQuery = useFetchFilesByUIDQuery(field?.value || [])

  useEffect(() => {
    if (!field.value?.length || !fileListQuery?.data?.length) return

    if (field.value.length !== fileListQuery.data.length) {
      setError(field.name, { type: 'custom', message: noAccessText.multi })
    }
  }, [field?.value, fileListQuery?.data])

  return (
    <>
      <SelectMultiFileInput
        dialogType="checkbox"
        dialogTitle="Select input files"
        disabled={disabled}
        onChange={value => {
          field.onChange(value?.map(v => v.uid) ?? null)
          field.onBlur()
        }}
        value={field?.value ?? null}
        scopes={enhanceScope(scope)}
      />

      <FieldInfo text={inputSpec.help} />
      <ErrorMessageForField errors={errors} fieldName={field.name} />
    </>
  )
}

const SingleFileInput = ({
  disabled,
  field,
  scope,
  inputSpec,
  errors,
  setError,
}: {
  inputSpec: InputSpec
  field: ControllerRenderProps<RunJobFormType, any>
  errors: FieldErrors<Record<string, unknown>>
  setError: UseFormSetError<RunJobFormType>
  disabled: boolean
  scope: string
}) => {
  const fileListQuery = useFetchFilesByUIDQuery([field?.value] || [])
  const error = fileListQuery?.data?.length === 0

  useEffect(() => {
    if (error) {
      setError(field.name, { type: 'custom', message: noAccessText.single })
    }
  }, [error])

  return (
    <>
      <SelectMultiFileInput
        dialogTitle="Select input file"
        disabled={disabled}
        onChange={value => {
          field.onChange(value?.[0].uid ?? null)
          field.onBlur()
        }}
        dialogType="radio"
        value={field.value && [field.value]}
        scopes={enhanceScope(scope)}
      />

      <FieldInfo text={inputSpec.help} />
      <ErrorMessageForField errors={errors} fieldName={field.name} />
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
}: {
  inputSpec: InputSpec
  field: ControllerRenderProps<RunJobFormType, any>
  errors: FieldErrors<Record<string, unknown>>
  disabled: boolean
  register: UseFormRegister<RunJobFormType>
  setError: UseFormSetError<RunJobFormType>
  scope: string
}) => {
  const choices = Array.isArray(inputSpec?.choices) ? inputSpec.choices : null

  const InputSelect = choices ? Select : CreatableSelect

  switch (inputSpec.class) {
    case 'file': {
      return (
        <SingleFileInput
          setError={setError}
          disabled={disabled}
          errors={errors}
          field={field}
          inputSpec={inputSpec}
          scope={scope}
        />
      )
    }
    case 'array:file': {
      return (
        <ArrayFileInput
          setError={setError}
          disabled={disabled}
          errors={errors}
          field={field}
          inputSpec={inputSpec}
          scope={scope}
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
