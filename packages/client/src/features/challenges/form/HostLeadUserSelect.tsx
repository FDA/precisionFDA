import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Select from 'react-select'
import { fetchHostLeads } from './api'

const useFetchHostLeadUsersQuery = () =>
  useQuery({
    queryKey: ['host-lead-users'],
    queryFn: fetchHostLeads,
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
      inputId="challenge_host-lead-user"
    />
  )
}
