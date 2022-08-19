import React from 'react'
import { useQuery } from 'react-query'
import Select from 'react-select'
import { fetchScoringAppUsers } from './api'

const useFetchScoringAppUsersQuery = () =>
  useQuery('scoring-app-users', fetchScoringAppUsers, {
    select(data) {
      return data?.map(s => ({
        label: s[0],
        value: s[1],
      }))
    },
  })

export const ScoringAppUserSelect = ({
  value,
  onBlur,
  isSubmitting,
  onChange,
}: {
  value: {label: string, value: string} | null
  onBlur: () => void
  isSubmitting: boolean
  onChange: (v:any) => void
}) => {
  const { data: scoringAppUserOptions, isLoading } = useFetchScoringAppUsersQuery()
  return (
    <Select
      options={scoringAppUserOptions}
      placeholder="Choose..."
      onChange={onChange}
      isClearable
      isSearchable
      onBlur={onBlur}
      value={value}
      isDisabled={isSubmitting}
      isLoading={isLoading}
    />
  )
}
