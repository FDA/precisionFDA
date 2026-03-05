import React from 'react'
import { ControllerRenderProps, FieldValues, Path } from 'react-hook-form'
import styled from 'styled-components'
import { Loader } from '@/components/Loader'
import { Select } from '@/components/Select'
import { useComputeInstances } from '../useComputeInstances'

const StyledInstanceSelect = styled(Select)`
  min-width: 225px;
`

interface SelectOption {
  value: string
  label: string
}

type InstanceTypeSelectProps<T extends FieldValues = FieldValues> = {
  field: ControllerRenderProps<T, Path<T>>
}

export const InstanceTypeSelect = <T extends FieldValues = FieldValues>({ field }: InstanceTypeSelectProps<T>) => {
  const { computeInstances, isLoading } = useComputeInstances()
  if (isLoading) return <Loader />

  return (
    <StyledInstanceSelect
      {...field}
      options={computeInstances}
      onChange={option => {
        const selectedOption = option as SelectOption | null
        field.onChange(selectedOption?.value || '')
      }}
      onBlur={field.onBlur}
      value={computeInstances.find((option: SelectOption) => option.value === field.value)}
    />
  )
}
