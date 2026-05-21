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
import { fetchScoringAppUsers } from './api'

export type ScoringAppUserOption = { label: string; value: number }

const useFetchScoringAppUsersQuery = () =>
  useQuery({
    queryKey: ['scoring-app-users'],
    queryFn: fetchScoringAppUsers,
    select(data) {
      const rows = data as [string, number][] | undefined
      return rows?.map(s => ({
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
  value: ScoringAppUserOption | null
  onBlur: () => void
  isSubmitting: boolean
  onChange: (v: unknown) => void
}) => {
  const { data: scoringAppUserOptions, isLoading } = useFetchScoringAppUsersQuery()
  const options = scoringAppUserOptions ?? []

  return (
    <div data-testid="challenge-scoring-app-select">
      <Combobox<ScoringAppUserOption>
        id="challenge_scoring-app-user"
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
        disabled={isSubmitting || isLoading}
      >
        <ComboboxInput
          placeholder={isLoading ? '' : 'Choose…'}
          className={cn('relative max-w-full', isLoading && '[&_input]:caret-transparent [&_input]:text-transparent')}
          disabled={isSubmitting || isLoading}
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
          <ComboboxEmpty>No scoring app users match.</ComboboxEmpty>
          <ComboboxList>
            {(item: ScoringAppUserOption) => (
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
