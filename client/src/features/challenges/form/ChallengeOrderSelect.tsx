import React from 'react'
import { useQuery } from 'react-query'
import Select from 'react-select'
import { fetchChallengeOrders } from './api'


export const ChallengeOrderSelect = ({
  value,
  onBlur,
  isSubmitting,
  onChange,
}: {
  value: { label: string, value: string } | undefined
  onBlur: () => void
  isSubmitting: boolean
  onChange: (v: any) => void
}) => {
  const { data: ordersOptions, isLoading } = useQuery('challenge-scopes', () => fetchChallengeOrders(), {
    select(data) {
      return data?.map(s => ({
        label: s[0],
        value: s[1],
      })).filter(o => o.label !== null)
    },
  })
  return (
    <Select
      options={ordersOptions}
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
