import React from 'react'
import styled from 'styled-components'
import { Loader } from '../../../components/Loader'
import { Select } from '../../../components/Select'
import { useFetchComputeInstanceQuery } from '../useFetchComputeInstanceQuery'
import { ControllerRenderProps, FieldValues, Path } from 'react-hook-form'

const StyledInstanceSelect = styled(Select)`
  min-width: 225px;
`

interface ComputeInstance {
  value: string
  label: string
}

interface SelectOption {
  value: string
  label: string
}

type InstanceTypeSelectProps<T extends FieldValues = FieldValues> = {
  field: ControllerRenderProps<T, Path<T>>
}

export const InstanceTypeSelect = <T extends FieldValues = FieldValues>({ field }: InstanceTypeSelectProps<T>) => {
  const { data, isLoading } = useFetchComputeInstanceQuery()
  if (isLoading) return <Loader />

  const options: SelectOption[] = Array.isArray(data) ? 
    data.map((i: ComputeInstance) => ({ value: i.value, label: i.label })) : []

  return (
    <StyledInstanceSelect
      {...field}
      options={options}
      onChange={option => {
        const selectedOption = option as SelectOption | null
        field.onChange(selectedOption?.value || '')
      }}
      onBlur={field.onBlur}
      value={options?.find((option: SelectOption) => option.value === field.value)}
    />
  )
}
