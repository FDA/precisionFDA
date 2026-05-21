import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/utils/cn'

export const StatusSelect = ({
  value,
  onBlur,
  isDisabled,
  onChange,
}: {
  value: { label: string; value: string } | null
  onBlur: () => void
  isDisabled: boolean
  onChange: (v: unknown) => void
}) => {
  const options = ['open', 'closed'].map(option => ({
    label: option,
    value: option,
  }))

  return (
    <div data-testid="data-portal-status-select">
      <Select
        id="data-portal_status"
        items={options}
        value={value?.value ?? null}
        onValueChange={v => {
          const chosen = options.find(o => o.value === v)
          onChange(chosen ?? null)
          onBlur()
        }}
        disabled={isDisabled}
      >
        <SelectTrigger className={cn('w-full min-w-0 justify-between')} onBlur={onBlur}>
          <SelectValue placeholder="Choose…" />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
