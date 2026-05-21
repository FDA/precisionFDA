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
import { fetchActiveUsers } from '../api'

type UserOption = { label: string; value: string }

const useFetchActiveUsersQuery = () =>
  useQuery({
    queryKey: ['gov-users'],
    queryFn: fetchActiveUsers,
    select(data) {
      return data?.map(s => ({
        label: s,
        value: s,
      }))
    },
  })

export const UsersSelect = ({
  value,
  onBlur,
  isDisabled,
  onChange,
  inputId,
}: {
  value: UserOption | null
  onBlur: () => void
  isDisabled: boolean
  onChange: (v: unknown) => void
  inputId?: string
}) => {
  const { data: userOptions, isLoading } = useFetchActiveUsersQuery()
  const options = userOptions ?? []

  return (
    <div data-testid="data-portal-users-select">
      <Combobox<UserOption>
        id={inputId}
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
          <ComboboxEmpty>No active users match.</ComboboxEmpty>
          <ComboboxList>
            {(item: UserOption) => (
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
