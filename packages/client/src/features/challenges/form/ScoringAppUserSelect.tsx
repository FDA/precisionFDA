import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchScoringAppUsers } from './api'
import { Select } from '../../../components/Select'

const useFetchScoringAppUsersQuery = () =>
  useQuery({
    queryKey: ['scoring-app-users'],
    queryFn: fetchScoringAppUsers,
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
  value: {label: string, value: number} | null
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
      inputId="challenge_scoring-app-user"
    />
  )
}
