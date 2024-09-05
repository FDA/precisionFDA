import React from 'react'
import { Control, Controller, FieldErrors } from 'react-hook-form'
import { FieldGroup } from '../../../components/form/FieldGroup'
import { Select } from '../../../components/Select'
import { ErrorMessageForField } from './ErrorMessageForField'
import { RunJobFormType, SelectType } from '../apps.types'

/**
 * Component for selecting context if applicable.
 *
 * @param control
 * @param isSubmitting
 * @param selectableContexts
 * @param errors
 * @constructor
 */
export const SelectContext = ({
  control,
  isSubmitting,
  selectableContexts,
  errors,
}: {
  control: Control<RunJobFormType>
  isSubmitting: boolean
  selectableContexts: SelectType[] | undefined,
  errors: FieldErrors<RunJobFormType>,
}) => {
  return (
    <FieldGroup label="Context" required>
      <Controller
        name="scope"
        control={control}
        render={({ field }) => (
          <Select
            options={selectableContexts}
            placeholder="Choose..."
            onChange={value => {
              field.onChange(value)
              field.onBlur()
            }}
            isSearchable
            onBlur={field.onBlur}
            value={field.value}
            isDisabled={isSubmitting}
            inputId="select_context"
          />
        )}
      />
      <ErrorMessageForField errors={errors as FieldErrors<Record<string, unknown>>} fieldName="scope" />
    </FieldGroup>
  )
}
