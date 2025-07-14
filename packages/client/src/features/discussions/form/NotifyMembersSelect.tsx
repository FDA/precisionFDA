import React, { useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SelectInstance } from 'react-select'
import styled from 'styled-components'
import { Select } from '../../../components/Select'
import { spacesMembersListRequest } from '../../spaces/members/members.api'
import { NoteScope } from '../api'
import { getSpaceIdFromScope } from '../../../utils'

const StyledSelect = styled(Select)`
  --slect-height: none;
`

// ATM only used for fetching active space members, won't work for public discussions
const useFetchNotifyMembersQuery = (spaceId: string) =>
  useQuery({
    queryKey: ['challenge-scopes'],
    queryFn: () => spacesMembersListRequest({ spaceId, sideRole: undefined }),
    select(data) {
      return data.space_memberships
        .filter(sm => sm.active)
        .map(sm => ({
          label: sm.title,
          value: sm.user_name,
        }))
    },
  })

/**
 * UI multi-select component that populates options with active space members user can pick from to notify.
 */
export const NotifyMembersSelect = ({
  value,
  onBlur,
  isSubmitting,
  onChange,
  scope,
}: {
  value: { label: string; value: string }[] | null
  onBlur: () => void
  isSubmitting: boolean
  onChange: (v: unknown) => void
  scope: NoteScope
}) => {
  const spaceId = getSpaceIdFromScope(scope)
  const ref = useRef<SelectInstance>(null)
  const { data: options, isLoading } = useFetchNotifyMembersQuery(spaceId!)
  options?.unshift({ value: 'author', label: 'Author Only' }, { value: 'all', label: 'All Space Members' })

  // if any of the values is 'all' or 'author', remove all other options
  if (value?.some(v => ['all', 'author'].includes(v.value))) {
    options?.splice(0, options.length)
    ref.current?.blur()
    if (value?.length > 1) {
      onChange(value.filter(v => ['all', 'author'].includes(v.value)))
    }
  }

  return (
    <StyledSelect
      // @ts-expect-error ref not compatible with styled-components
      ref={ref}
      options={options}
      placeholder="Members to notify..."
      onChange={onChange}
      isSearchable
      isMulti
      menuPlacement="auto"
      onBlur={onBlur}
      value={value}
      isDisabled={isSubmitting}
      isLoading={isLoading}
      maxMenuHeight={300}
      closeMenuOnSelect={false}
      inputId="notify_members"
    />
  )
}
