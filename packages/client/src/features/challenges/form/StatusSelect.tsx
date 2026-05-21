import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/utils/cn'

export const StatusSelect = ({
  isEditing = false,
  value,
  onBlur,
  isSubmitting,
  onChange,
}: {
  isEditing?: boolean
  value: { label: string; value: string } | null
  onBlur: () => void
  isSubmitting: boolean
  onChange: (v: unknown) => void
}) => {
  const statusKeys = ['setup', 'pre-registration']
  if (isEditing) {
    statusKeys.push('open', 'paused', 'archived', 'result_announced')
  }
  const options = statusKeys.map(option => ({
    label: option,
    value: option,
  }))

  return (
    <div data-testid="challenge-status-select">
      <Select
        id="challenge_status"
        items={options}
        value={value?.value ?? null}
        onValueChange={v => {
          const chosen = options.find(o => o.value === v)
          onChange(chosen ?? null)
          onBlur()
        }}
        disabled={isSubmitting}
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
