import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Select from 'react-select'
import { fetchChallengeScopes } from './api'

const useFetchChallengeScopesQuery = () =>
  useQuery({
    queryKey: ['challenge-scopes'],
    queryFn: () => fetchChallengeScopes(),
    select(data) {
      return data?.map(s => ({
        label: s[0],
        value: s[1],
      })).filter(o => o.label !== null)
    },
  })

export const ScopeFieldSelect = ({
  value,
  onBlur,
  isSubmitting,
  onChange,
}: {
  value: { label: string, value: string } | null
  onBlur: () => void
  isSubmitting: boolean
  onChange: (v: any) => void
}) => {
  const { data: scopesOptions, isLoading } = useFetchChallengeScopesQuery()
  return (
    <Select
      options={scopesOptions}
      placeholder="Choose..."
      onChange={onChange}
      isClearable
      isSearchable
      onBlur={onBlur}
      value={value}
      isDisabled={isSubmitting}
      isLoading={isLoading}
      inputId="challenge_scope"
    />
  )
}
