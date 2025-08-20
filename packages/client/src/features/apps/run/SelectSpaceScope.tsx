import { Control, Controller, FieldErrors, Path } from 'react-hook-form'
import React from 'react'
import { FieldGroup } from '../../../components/form/FieldGroup'
import { Select } from '../../../components/Select'
import { ErrorMessageForField } from './ErrorMessageForField'
import { SelectableSpace, SelectType } from '../apps.types'

/**
 * Component for selecting space scope if applicable.
 *
 * @param control
 * @param isSubmitting
 * @param selectableSpaces
 * @param errors
 * @constructor
 */
export function SelectSpaceScope<T extends { scope: SelectType }>({
  control,
  isSubmitting,
  selectableSpaces,
  errors,
}: {
  control: Control<T>
  isSubmitting: boolean
  selectableSpaces: SelectableSpace[] | undefined
  errors: FieldErrors<T>
}) {
  return (
  <FieldGroup label="Space scope" required>
    <Controller
      name={'scope' as Path<T>}
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
