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
import { fetchChallengeScopes } from './api'

type ScopeOption = { label: string; value: string }

const useFetchChallengeScopesQuery = () =>
  useQuery({
    queryKey: ['challenge-scopes'],
    queryFn: () => fetchChallengeScopes(),
    select(data) {
      return data
        ?.map(s => ({
          label: s[0],
          value: s[1],
        }))
        .filter((o): o is ScopeOption => o.label != null)
    },
  })

export const ScopeFieldSelect = ({
  value,
  onBlur,
  isSubmitting,
  onChange,
}: {
  value: ScopeOption | null
  onBlur: () => void
  isSubmitting: boolean
  onChange: (v: unknown) => void
}) => {
  const { data: scopesOptions, isLoading } = useFetchChallengeScopesQuery()
  const options = scopesOptions ?? []

  return (
    <div data-testid="challenge-scope-select">
      <Combobox<ScopeOption>
        id="challenge_scope"
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
          <ComboboxEmpty>No scopes match.</ComboboxEmpty>
          <ComboboxList>
            {(item: ScopeOption) => (
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
