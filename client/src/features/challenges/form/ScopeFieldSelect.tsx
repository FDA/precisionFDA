import React from 'react'
import { useQuery } from 'react-query'
import Select from 'react-select'
import { fetchChallengeScopes } from './api'

const useFetchChallengeScopesQuery = (id?: string) =>
  useQuery('challenge-scopes', () => fetchChallengeScopes(id), {
    select(data) {
      return data?.map(s => ({
        label: s[0],
        value: s[1],
      })).filter(o => o.label !== null)
    },
  })

export const ScopeFieldSelect = ({
  challengeId,
  value,
  onBlur,
  isSubmitting,
  onChange,
}: {
  challengeId?: string
  value: { label: string, value: string } | null
  onBlur: () => void
  isSubmitting: boolean
  onChange: (v: any) => void
}) => {
  const { data: scopesOptions, isLoading } = useFetchChallengeScopesQuery(challengeId)
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
    />
  )
}
