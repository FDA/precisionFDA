import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchActiveUsers, fetchGovUsers } from '../api'
import { Select } from '../../../components/Select'

const useFetchGovUsersQuery = () =>
  useQuery({
    queryKey: ['gov-users'],
    queryFn: fetchGovUsers,
    select(data) {
      return data?.map(s => ({
        label: s,
        value: s,
      }))
    },
  })
const useFetchActiveUsersQuery = () =>
  useQuery({
    queryKey: ['gov-users'],
    queryFn: fetchActiveUsers,
    select(data) {
      return data?.map(s => ({
        label: s,
        value: s,
      }))
    },
  })

export const UsersSelect = ({
  value,
  onBlur,
  isDisabled,
  onChange,
  inputId,
}: {
  value: {label: string, value: string} | null
  onBlur: () => void
  isDisabled: boolean
  onChange: (v:any) => void
  inputId?: string
}) => {
  const { data, isLoading } = useFetchActiveUsersQuery()
  return (
    <Select
      options={data}
      placeholder="Choose..."
      onChange={onChange}
      isClearable
      isSearchable
      onBlur={onBlur}
      value={value}
      isDisabled={isDisabled}
      isLoading={isLoading}
      inputId={inputId}
    />
  )
}
