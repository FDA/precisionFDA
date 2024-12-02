import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchGuestLeads } from './api'
import { Select } from '../../../components/Select'

const useFetchGuestLeadUsersQuery = () =>
  useQuery({
    queryKey: ['guest-lead-users'],
    queryFn: fetchGuestLeads,
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
      inputId="challenge_guest-lead-user"
    />
  )
}
