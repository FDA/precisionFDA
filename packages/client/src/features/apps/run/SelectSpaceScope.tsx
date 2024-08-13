import { Control, Controller, FieldErrors } from 'react-hook-form'
import React from 'react'
import { FieldGroup } from '../../../components/form/FieldGroup'
import { Select } from '../../../components/Select'
import { ErrorMessageForField } from './ErrorMessageForField'
import { RunJobFormType, SelectableSpace } from '../apps.types'
import { RunWorkflowFormType } from '../../workflows/run/RunWorkflowForm'

/**
 * Component for selecting space scope if applicable.
 *
 * @param control
 * @param isSubmitting
 * @param selectableSpaces
 * @param errors
 * @constructor
 */
export const SelectSpaceScope = ({
  control,
  isSubmitting,
  selectableSpaces,
  errors,
}: {
  control: Control<RunJobFormType | RunWorkflowFormType>
  isSubmitting: boolean
  selectableSpaces: SelectableSpace[] | undefined
  errors: FieldErrors<RunJobFormType | RunWorkflowFormType>
}) => {
  return (
  <FieldGroup label="Space scope" required>
    <Controller
      name="scope"
      control={control}
      render={({ field }) => (
        <Select
          options={selectableSpaces}
          placeholder="Choose..."
          onChange={value => {
            field.onChange(value)
            field.onBlur()
          }}
          isClearable
          isSearchable
          onBlur={field.onBlur}
          value={field.value}
          isDisabled={isSubmitting}
          inputId="select_context"
        />
      )}
    />
    <ErrorMessageForField errors={errors as FieldErrors<Record<string, unknown>>} fieldName="scope" />
  </FieldGroup>)
}
