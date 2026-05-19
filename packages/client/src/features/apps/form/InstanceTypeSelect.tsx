import type { ControllerRenderProps, FieldValues, Path, PathValue } from 'react-hook-form'
import { Loader } from '@/components/Loader'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/utils/cn'
import type { ComputeInstance } from '../apps.types'
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
  if (isLoading) return <Loader />

  return (
    <Select
      id={id}
      items={options}
      value={value}
      onValueChange={v => {
        onChange(v ?? '')
      }}
      name={name}
      disabled={disabled}
    >
      <SelectTrigger className={cn('w-full min-w-56 max-w-full', triggerClassName)} onBlur={onBlur} ref={ref}>
        <SelectValue placeholder={placeholder} />
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
}

export const InstanceTypeSelect = <T extends FieldValues = FieldValues>({ id, field }: InstanceTypeSelectProps<T>) => {
  const { computeInstances, isLoading } = useComputeInstances()
  return (
    <ComputeInstanceSelect
      id={id}
      name={field.name}
      value={field.value == null || field.value === '' ? null : String(field.value)}
      onChange={instanceId => {
        field.onChange(instanceId as PathValue<T, Path<T>>)
      }}
      onBlur={field.onBlur}
      ref={field.ref}
      options={computeInstances}
      isLoading={isLoading}
    />
  )
}
