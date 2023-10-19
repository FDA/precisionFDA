import { isArray, isSafeInteger } from 'lodash'
import React from 'react'
import {
  ControllerRenderProps,
  FieldErrors,
  UseFormRegister,
} from 'react-hook-form'
import Select, { SingleValueProps, components } from 'react-select'
import CreatableSelect from 'react-select/creatable'
import styled from 'styled-components'
import {
  BoolButton,
  BoolButtonGroup,
} from '../../../../components/Button/BoolButtons'
import { InputText } from '../../../../components/InputText'
import { FieldInfo } from '../../../../components/form/FieldInfo'
import { SelectMultiFileInput } from '../SelectMultiFileInput'
import { IOSpec, InputSpec, JobRunForm } from '../apps.types'
import { isFloatValid, isStrictlyInteger } from '../form/common'
import { ErrorMessageForField } from './ErrorMessageForField'

const getDefaultValue = (val: any) => {
  if (val === null || val.length === 0) {
    return undefined
  }
  let op
  if (isArray(val)) {
    op = val.map(value => ({ value, label: value }))
  } else {
    op = { value: val, label: val }
  }
  return op
}

/**
 * Only with file select component we need to show field value that we
 * might get as inputs[field_name]. In this case exctract the field name.
 *
 * In case hash is also present we extract what is after the hash
 *
 * @param fieldName
 */
const extractFieldName = (fieldName: string) => {
  if (fieldName.includes('[')) {
    const removedSquares = fieldName.substring(
      fieldName.indexOf('[') + 1,
      fieldName.lastIndexOf(']'),
    )
    if (removedSquares.includes('#')) {
      return removedSquares.substring(
        removedSquares.indexOf('#') + 1,
        removedSquares.length,
      )
    }
    return removedSquares
  }
  return fieldName
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

export const JobRunInput = ({
  inputSpec,
  field,
  errors,
  disabled,
  register,
  scope,
}: {
  inputSpec: InputSpec
  field: ControllerRenderProps<JobRunForm, `inputs.${string}`>
  errors: FieldErrors<Record<string, unknown>>
  disabled: boolean
  register: UseFormRegister<JobRunForm>
  scope: string
}) => {
  const choices = Array.isArray(inputSpec?.choices) ? inputSpec.choices : null

  const InputSelect = choices ? Select : CreatableSelect

  switch (inputSpec.class) {
    case 'file': {
      return (
        <>
          <SelectMultiFileInput
            dialogTitle="Select input file"
            disabled={disabled}
            onChange={value => {
              field.onChange(value && value[0].uid)
              field.onBlur()
            }}
            dialogType="radio"
            value={field.value && [field.value]}
            scope={scope}
          />

          <FieldInfo text={inputSpec.help} />
          <ErrorMessageForField errors={errors} fieldName={field.name} />
        </>
      )
    }
    case 'array:file': {
      return (
        <>
          <SelectMultiFileInput
            dialogType="checkbox"
            dialogTitle="Select input files"
            disabled={disabled}
            onChange={value => {
              field.onChange(value?.map(v => v.uid))
              field.onBlur()
            }}
            value={field?.value ?? null}
            scope={scope}
          />

          <FieldInfo text={inputSpec.help} />
          <ErrorMessageForField errors={errors} fieldName={field.name} />
        </>
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
                field.onChange(val.value)
              }}
            />
          ) : (
            <InputText
              type="text"
              disabled={disabled}
              {...register(field.name)}
            />
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
                field.onChange(val.value)
              }}
            />
          ) : (
            <InputText
              type="text"
              disabled={disabled}
              {...register(field.name)}
            />
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
                field.onChange(val.value)
              }}
            />
          ) : (
            <InputText
              type="text"
              disabled={disabled}
              {...register(field.name)}
            />
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
      const val = field.value
      return (
        <>
          <BoolButtonGroup>
            <BoolButton
              type="button"
              active={val === 'true'}
              onClick={() => {
                field.onChange(val === 'true' ? null : 'true')
                field.onBlur()
              }}
            >
              True
            </BoolButton>

            <BoolButton
              type="button"
              active={val === 'false'}
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
