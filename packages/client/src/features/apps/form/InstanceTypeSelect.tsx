import React from 'react'
import { ControllerRenderProps, FieldValues } from 'react-hook-form'
import styled from 'styled-components'
import { Loader } from '../../../components/Loader'
import { Select } from '../../../components/Select'
import { useFetchComputeInstanceQuery } from '../useFetchComputeInstanceQuery'

const StyledInstanceSelect = styled(Select)`
  min-width: 225px;
`

type InstanceTypeSelectProps = {
  field: ControllerRenderProps<FieldValues, 'instance_type'>
}

export const InstanceTypeSelect = ({ field }: InstanceTypeSelectProps) => {
  const { data, isLoading } = useFetchComputeInstanceQuery()
  if (isLoading) return <Loader />

  const options = data?.map(i => ({ value: i.value, label: i.label }))

  return (
    <StyledInstanceSelect
      {...field}
      options={options}
      onChange={option => field.onChange(option?.value)}
      onBlur={field.onBlur}
      value={options?.find(option => option.value === field.value)}
    />
  )
}
