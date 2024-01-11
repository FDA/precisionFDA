import React from 'react'
import { useFetchComputeInstanceQuery } from '../useFetchComputeInstanceQuery'
import { Loader } from '../../../components/Loader'
import { ControllerRenderProps } from 'react-hook-form'
import { FieldValues } from 'react-hook-form'
import { Select } from '../../../components/Select'

type InstanceTypeSelectProps = {
  field: ControllerRenderProps<FieldValues, 'instance_type'>
}

export const InstanceTypeSelect = ({ field }: InstanceTypeSelectProps) => {
  const { data, isLoading } = useFetchComputeInstanceQuery()
  if (isLoading) return <Loader />

  const options = data?.map(i => ({ value: i.value, label: i.label }))

  return (
    <Select
      {...field}
      options={options}
      onChange={option => field.onChange(option?.value)}
      onBlur={field.onBlur}
      value={options?.find(option => option.value === field.value)}
    />
  )
}
