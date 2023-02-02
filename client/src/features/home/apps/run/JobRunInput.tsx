import React from 'react'
import Select from 'react-select'
import { Control, Controller, FieldErrors, UseFormRegister } from 'react-hook-form'
import { INPUT_TYPES_CLASSES, ListedFile } from '../apps.types'
import { ButtonBoolean } from '../../../../components/ButtonBoolean'
import { ErrorMessageForField } from './ErrorMessageForField'
import { InputText } from '../../../../components/InputText'
import { SelectFileInput } from './SelectFileInput'
import { FieldInfo } from '../../../../components/form/FieldInfo'

const JobRunChoices = ({
  fieldName,
  defaultValue,
  choices,
  helpText,
  errors,
  disabled,
  control,
}: {
  fieldName: string
  defaultValue: string | boolean
  choices: []
  helpText?: string
  errors: FieldErrors<Record<string, unknown>>
  disabled: boolean
  control: Control<any, any>
}) => {
  const options = choices.map(value => ({ value, label: value }))
  return (
    <>
      <Controller
        control={control}
        defaultValue={defaultValue}
        name={fieldName}
        render={({ field }) => (
          <Select
            inputRef={field.ref}
            options={options}
            isDisabled={disabled}
            value={options.find(c => c.value === field.value)}
            onBlur={field.onBlur}
            onChange={val => {
              field.onBlur()
              field.onChange(val?.value)
            }}
          />
        )}
      />
      <FieldInfo text={helpText} />
      <ErrorMessageForField errors={errors} fieldName={fieldName} />
    </>
  )
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
    const removedSquares = fieldName.substring(fieldName.indexOf('[') + 1, fieldName.lastIndexOf(']'))
    if (removedSquares.includes('#')) {
      return removedSquares.substring(removedSquares.indexOf('#') + 1, removedSquares.length)
    } 
    return removedSquares
  } 
  return fieldName
}

export const JobRunInput = ({
  fieldName,
  defaultValue,
  type,
  helpText,
  choices,
  errors,
  disabled,
  control,
  register,
  scope,
}: {
  fieldName: string
  defaultValue?: string | boolean | number | ListedFile
  type: string
  helpText?: string
  choices: []
  errors: FieldErrors<Record<string, unknown>>
  disabled: boolean
  control: Control<any, any>
  register: UseFormRegister<any>
  scope: string
}) => {
  if (choices) {
    return (
      <JobRunChoices
        fieldName={fieldName}
        defaultValue={defaultValue as string}
        choices={choices}
        helpText={helpText}
        disabled={disabled}
        errors={errors}
        control={control}
      />
    )
  }
  switch (type) {
    case INPUT_TYPES_CLASSES.FILE: {
      return (
        <>
          <Controller
            control={control}
            name={fieldName}
            render={({ field }) =>
            (<SelectFileInput
              dialogTitle={`Select input for ${extractFieldName(fieldName)}`}
              disabled={disabled}
              onChange={value => {
                field.onChange(value)
                field.onBlur()
              }}
              value={defaultValue as ListedFile}
              scope={scope}
            />)
            }
          />
          <FieldInfo text={helpText} />
          <ErrorMessageForField errors={errors} fieldName={fieldName} />
        </>
      )
    }
    case INPUT_TYPES_CLASSES.STRING: {
      return (
        <>
          <InputText disabled={disabled} {...register(fieldName)} />
          <FieldInfo text={helpText} />
          <ErrorMessageForField errors={errors} fieldName={fieldName} />
        </>
      )
    }
    case INPUT_TYPES_CLASSES.INT: {
      return (
        <>
          <InputText type="number" pattern="[0-9]+" disabled={disabled} {...register(fieldName)} />
          <FieldInfo text={helpText} />
          <ErrorMessageForField errors={errors} fieldName={fieldName} />
        </>
      )
    }
    case INPUT_TYPES_CLASSES.FLOAT: {
      return (
        <>
          <InputText type="number" disabled={disabled} {...register(fieldName)} />
          <FieldInfo text={helpText} />
          <ErrorMessageForField errors={errors} fieldName={fieldName} />
        </>
      )
    }
    case INPUT_TYPES_CLASSES.BOOLEAN: {
      return (
        <>
          <Controller
            control={control}
            name={fieldName}
            render={({ field }) =>
            (<ButtonBoolean
              onChange={field.onChange}
              onBlur={field.onBlur}
              disabled={disabled}
              value={field.value}
              defaultValue={defaultValue as boolean}
            />)
            }
          />
          <FieldInfo text={helpText} />
          <ErrorMessageForField errors={errors} fieldName={fieldName} />
        </>
      )
    }
    default: {
      return <>`ERROR: Unknown type of input class ${type}`</>
    }
  }
}