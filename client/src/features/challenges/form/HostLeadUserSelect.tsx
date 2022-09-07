import React from 'react'
import { useQuery } from 'react-query'
import Select from 'react-select'
import { fetchHostLeads } from './api'

const useFetchHostLeadUsersQuery = () =>
  useQuery('host-lead-users', fetchHostLeads, {
    select(data) {
      return data?.map(s => ({
        label: s,
        value: s,
      }))
    },
  })

export const HostLeadUserSelect = ({
  value,
  onBlur,
  isDisabled,
  onChange,
}: {
  value: {label: string, value: string} | null
  onBlur: () => void
  isDisabled: boolean
  onChange: (v:any) => void
}) => {
  const { data: hostLeadUserOptions, isLoading } = useFetchHostLeadUsersQuery()
  return (
    <Select
      options={hostLeadUserOptions}
      placeholder="Choose..."
      onChange={onChange}
      isClearable
      isSearchable
      onBlur={onBlur}
      value={value}
      isDisabled={isDisabled}
      isLoading={isLoading}
    />
  )
}
