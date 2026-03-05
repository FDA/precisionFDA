import React from 'react'
import { Control, Controller, FieldErrors, Path } from 'react-hook-form'
import { FieldGroup } from '@/components/form/FieldGroup'
import { Select } from '@/components/Select'
import { ComputeResourceKey, ComputeResourcePricingMap } from '@/types/user'
import { ComputeInstance, RunJobFormType } from '../apps.types'
import { ErrorMessageForField } from './ErrorMessageForField'
import { StyledMaxRuntime } from './styles'

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
  control: Control<RunJobFormType, unknown, unknown>
  selectedInstance: ComputeInstance | undefined
  name: Path<RunJobFormType>
  jobLimit: number
  isSubmitting: boolean
  computeInstances: ComputeInstance[]
  isComputeInstancesLoading: boolean
  errors: FieldErrors<RunJobFormType>
  inputId: string
}) => {
  let maxRuntime = ''

  if (selectedInstance && selectedInstance.value in ComputeResourcePricingMap) {
    const costPerHour = ComputeResourcePricingMap[selectedInstance.value as ComputeResourceKey]
    if (costPerHour) {
      let hoursRuntime = jobLimit / costPerHour
      let remainingMinutes = Math.round((hoursRuntime % 1) * 60)
      if (remainingMinutes === 60) {
        hoursRuntime++
        remainingMinutes = 0
      }
      maxRuntime = `Max estimated runtime: ${Math.floor(hoursRuntime)}h${remainingMinutes ? ` ${remainingMinutes}m` : ''}`
    }
  }

  return (
    <FieldGroup label="Instance Type" required>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <>
            <Select
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
