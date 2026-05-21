import { Loader2Icon } from 'lucide-react'
import type { ControllerRenderProps, FieldValues, Path, PathValue } from 'react-hook-form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/utils/cn'
import type { ComputeInstance } from '../apps.types'
import { getVisibleComputeInstances } from '../instanceTypeAvailability'
import { useComputeInstances } from '../useComputeInstances'

export type ComputeInstanceSelectProps = {
  id: string
  name: string
  value: string | null
  onChange: (instanceId: string) => void
  onBlur: () => void
  ref: ControllerRenderProps<FieldValues, Path<FieldValues>>['ref']
  options: ComputeInstance[]
  isLoading: boolean
  disabled?: boolean
  placeholder?: string
  triggerClassName?: string
}

export const ComputeInstanceSelect = ({
  id,
  name,
  value,
  onChange,
  onBlur,
  ref,
  options,
  isLoading,
  disabled,
  placeholder = 'Select instance type',
  triggerClassName,
}: ComputeInstanceSelectProps) => {
  return (
    <Select
      id={id}
      items={options}
      value={value}
      onValueChange={v => {
        onChange(v ?? '')
        onBlur()
      }}
      name={name}
      disabled={disabled || isLoading}
    >
      <SelectTrigger
        className={cn(
          'relative w-full min-w-[220px] max-w-full',
          triggerClassName,
          isLoading && '**:data-[slot=select-value]:opacity-0',
        )}
        onBlur={onBlur}
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <span className="pointer-events-none absolute inset-y-0 left-2.5 z-10 flex items-center">
            <Loader2Icon aria-hidden className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
          </span>
        ) : null}
        <SelectValue placeholder={isLoading ? '' : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

type InstanceTypeSelectProps<T extends FieldValues = FieldValues> = {
  field: ControllerRenderProps<T, Path<T>>
  id: string
  onValueChange?: (instanceId: string) => void
}

export const InstanceTypeSelect = <T extends FieldValues = FieldValues>({
  id,
  field,
  onValueChange,
}: InstanceTypeSelectProps<T>) => {
  const { computeInstances, isLoading } = useComputeInstances()
  const rawString = field.value == null || field.value === '' ? null : String(field.value)
  const options = getVisibleComputeInstances(computeInstances, rawString)
  const selectValue = rawString

  return (
    <ComputeInstanceSelect
      id={id}
      name={field.name}
      value={selectValue}
      onChange={instanceId => {
        field.onChange(instanceId as PathValue<T, Path<T>>)
        onValueChange?.(instanceId)
      }}
      onBlur={field.onBlur}
      ref={field.ref}
      options={options}
      isLoading={isLoading}
    />
  )
}
