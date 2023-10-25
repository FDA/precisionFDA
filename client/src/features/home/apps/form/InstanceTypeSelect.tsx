import React from 'react'
import { ControllerRenderProps, FieldValues } from 'react-hook-form'
import { useFetchComputeInstanceQuery } from '../useFetchComputeInstanceQuery'
import { Loader } from '../../../../components/Loader'

export const InstanceTypeSelect = ({
  field,
}: {
  field: ControllerRenderProps<FieldValues, 'instance_type'>
}) => {
  const { data, isLoading } = useFetchComputeInstanceQuery()
  if(isLoading) return <Loader />

  return (
    <select {...field}>
      {data?.map(i => (
        <option key={i.value} value={i.value}>
          {i.label}
        </option>
      ))}
    </select>
  )
}
