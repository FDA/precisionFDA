import { Control, Controller, FieldErrors } from 'react-hook-form'
import React from 'react'
import { Select } from '../../../components/Select'
import { ErrorMessageForField } from './ErrorMessageForField'
import { FieldGroup } from '../../../components/form/FieldGroup'
import { ComputeInstance, PricingMap, RunJobFormType } from '../apps.types'
import { StyledInstanceType, StyledMaxRuntime } from './styles'

export const SelectInstanceType = ({
  control,
  selectedInstance,
  name,
  jobLimit,
  isSubmitting,
  computeInstances,
  isComputeInstancesLoading,
  errors,
  inputId,
}: {
  control: Control<RunJobFormType>
  selectedInstance: ComputeInstance | undefined,
  name: keyof RunJobFormType,
  jobLimit: number
  isSubmitting: boolean
  computeInstances: ComputeInstance[] | undefined
  isComputeInstancesLoading: boolean
  errors: FieldErrors<RunJobFormType>
  inputId: string
}) => {
  let maxRuntime = ''

  if (selectedInstance) {
    const costPerHour = PricingMap[selectedInstance.value as keyof typeof PricingMap] as number
    let hoursRuntime = jobLimit / costPerHour
    let remainingMinutes = Math.round((hoursRuntime % 1) * 60)
    if (remainingMinutes === 60) {
      hoursRuntime++
      remainingMinutes = 0
    }
    maxRuntime = `Max estimated runtime: ${Math.floor(hoursRuntime)}h${remainingMinutes ? ` ${remainingMinutes}m` : ''}`
  }

  return (
    <FieldGroup label="Instance Type" required>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <>
            <Select
              defaultValue={field.value}
              options={computeInstances}
              placeholder="Choose..."
              onChange={value => {
                field.onChange(value)
                field.onBlur()
              }}
              isLoading={isComputeInstancesLoading}
              isSearchable
              onBlur={field.onBlur}
              value={field.value}
              isDisabled={isSubmitting}
              inputId={inputId}
            />
            <StyledMaxRuntime>{maxRuntime}</StyledMaxRuntime>
          </>
        )}
      />
      <ErrorMessageForField errors={errors as FieldErrors<Record<string, unknown>>} fieldName={name} />
    </FieldGroup>
  )
}