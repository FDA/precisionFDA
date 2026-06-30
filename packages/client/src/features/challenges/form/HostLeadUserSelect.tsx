import { useQuery } from '@tanstack/react-query'
import { Loader2Icon } from 'lucide-react'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { cn } from '@/utils/cn'
import { fetchChallengeLeads } from './api'

type LeadOption = { label: string; value: string }

const useFetchHostLeadUsersQuery = () =>
  useQuery({
    queryKey: ['challenge-leads'],
    queryFn: fetchChallengeLeads,
    select(data) {
      return data.hostUsernames.map(s => ({
        label: s,
        value: s,
      }))
    },
  })

export const HostLeadUserSelect = ({
  value,
  onBlur,
  isDisabled,
  onChange,
}: {
  value: LeadOption | null
  onBlur: () => void
  isDisabled: boolean
  onChange: (v: unknown) => void
}) => {
  const { data: hostLeadUserOptions, isLoading } = useFetchHostLeadUsersQuery()
  const options = hostLeadUserOptions ?? []

  return (
    <div data-testid="challenge-host-lead-select">
      <Combobox<LeadOption>
        id="challenge_host-lead-user"
        required
        items={options}
        value={value}
        onValueChange={next => {
          if (next != null) {
            onChange(next)
          }
          onBlur()
        }}
        isItemEqualToValue={(a, b) => a.value === b.value}
        disabled={isDisabled || isLoading}
      >
        <ComboboxInput
          placeholder={isLoading ? '' : 'Choose…'}
          className={cn('relative max-w-full', isLoading && '[&_input]:caret-transparent [&_input]:text-transparent')}
          disabled={isDisabled || isLoading}
          aria-busy={isLoading}
          onBlur={onBlur}
        >
          {isLoading ? (
            <span className="pointer-events-none absolute inset-y-0 left-2.5 z-10 flex items-center">
              <Loader2Icon aria-hidden className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
            </span>
          ) : null}
        </ComboboxInput>
        <ComboboxContent side="bottom" align="start">
          <ComboboxEmpty>No host leads match.</ComboboxEmpty>
          <ComboboxList>
            {(item: LeadOption) => (
              <ComboboxItem key={item.value} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
