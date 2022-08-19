import React from 'react'
import { useQuery } from 'react-query'
import Select from 'react-select'
import { fetchGuestLeads } from './api'

const useFetchGuestLeadUsersQuery = () =>
  useQuery('guest-lead-users', fetchGuestLeads, {
    select(data) {
      return data?.map(s => ({
        label: s,
        value: s,
      }))
    },
  })

export const GuestLeadUserSelect = ({
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
  const { data: guestLeadUserOptions, isLoading } = useFetchGuestLeadUsersQuery()
  return (
    <Select
      options={guestLeadUserOptions}
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
