import React from 'react'
import { Select } from '../../../components/Select'

export const StatusSelect = ({
  value,
  onBlur,
  isDisabled,
  onChange,
}: {
  value: { label: string; value: string } | null
  onBlur: () => void
  isDisabled: boolean
  onChange: (v: any) => void
}) => {
  const statusOptions = ['open', 'closed']
  const options = statusOptions.map(option => ({
    label: option,
    value: option,
  }))
  return (
    <Select
      options={options}
      placeholder="Choose..."
      onChange={onChange}
      isClearable
      isSearchable
      onBlur={onBlur}
      value={value}
      isDisabled={isDisabled}
      inputId="data-portal_status"
    />
  )
}
