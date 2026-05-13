import { useQuery } from '@tanstack/react-query'
import { useRef } from 'react'
import type { SelectInstance } from 'react-select'
import { Select } from '@/components/Select'
import { getSpaceIdFromScope } from '@/utils'
import { spacesMembersListRequest } from '../../spaces/members/members.api'
import type { NoteScope } from '../api'

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
  const ref = useRef<SelectInstance<{ label: string; value: string }, true>>(null)
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
    <Select
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
