import React from 'react'
import Select from 'react-select'


export const StatusSelect = ({
  isEditing = false,
  value,
  onBlur,
  isSubmitting,
  onChange,
}: {
  isEditing?: boolean,
  value: {label: string, value: string} | null
  onBlur: () => void
  isSubmitting: boolean
  onChange: (v:any) => void
}) => {
  const statusOptions = ['setup', 'pre-registration']
  if(isEditing) {
    statusOptions.push('open', 'paused', 'archived', 'result_announced')
  }
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
      isDisabled={isSubmitting}
    />
  )
}
