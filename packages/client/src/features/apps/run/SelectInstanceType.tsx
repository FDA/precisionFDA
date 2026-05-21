import { Loader2Icon } from 'lucide-react'
import { type Control, Controller, type FieldErrors, type Path } from 'react-hook-form'
import { FieldGroup } from '@/components/form/FieldGroup'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { type ComputeResourceKey, ComputeResourcePricingMap } from '@/types/user'
import { cn } from '@/utils/cn'
import type { ComputeInstance, RunJobFormType } from '../apps.types'
import { getVisibleComputeInstances } from '../instanceTypeAvailability'
import { ErrorMessageForField } from './ErrorMessageForField'
import { StyledMaxRuntime } from './styles'

export const SelectInstanceType = ({
  control,
  selectedInstance,
  name,
  jobLimit,
  isSubmitting,
  computeInstances,
  isComputeInstancesLoading,
  errors,
  inputId,
}: {
  control: Control<RunJobFormType, unknown, unknown>
  selectedInstance: ComputeInstance | null | undefined
  name: Path<RunJobFormType>
  jobLimit: number
  isSubmitting: boolean
  computeInstances: ComputeInstance[]
  isComputeInstancesLoading: boolean
  errors: FieldErrors<RunJobFormType>
  inputId: string
}) => {
  let maxRuntime = ''

  if (selectedInstance && selectedInstance.value in ComputeResourcePricingMap) {
    const costPerHour = ComputeResourcePricingMap[selectedInstance.value as ComputeResourceKey]
    if (costPerHour) {
      let hoursRuntime = jobLimit / costPerHour
      let remainingMinutes = Math.round((hoursRuntime % 1) * 60)
      if (remainingMinutes === 60) {
        hoursRuntime++
        remainingMinutes = 0
      }
      maxRuntime = `Max estimated runtime: ${Math.floor(hoursRuntime)}h${remainingMinutes ? ` ${remainingMinutes}m` : ''}`
    }
  }

  return (
    <div className="w-full min-w-[220px] max-w-64">
      <FieldGroup label="Instance Type" required>
        <Controller
          name={name}
          control={control}
          render={({ field }) => {
            const current = field.value as ComputeInstance | null | undefined
            const options = getVisibleComputeInstances(computeInstances, current)
            const selectedValue = current?.value ?? null
            return (
              <>
                <Select
                  id={inputId}
                  name={String(field.name)}
                  items={options}
                  value={selectedValue}
                  onValueChange={id => {
                    const next = options.find(c => c.value === id)
                    if (next) {
                      field.onChange(next)
                    }
                    field.onBlur()
                  }}
                  disabled={isSubmitting || isComputeInstancesLoading}
                >
                  <SelectTrigger
                    className={cn(
                      'relative h-8 w-full min-w-[220px] max-w-full justify-between pr-1 pl-1.5',
                      isComputeInstancesLoading && '**:data-[slot=select-value]:opacity-0',
                    )}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    disabled={isSubmitting || isComputeInstancesLoading}
                    aria-busy={isComputeInstancesLoading}
                  >
                    {isComputeInstancesLoading ? (
                      <span className="pointer-events-none absolute inset-y-0 left-2.5 z-10 flex items-center">
                        <Loader2Icon aria-hidden className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
                      </span>
                    ) : null}
                    <SelectValue placeholder={isComputeInstancesLoading ? '' : 'Choose…'} />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <StyledMaxRuntime>{maxRuntime}</StyledMaxRuntime>
              </>
            )
          }}
        />
        <ErrorMessageForField errors={errors as FieldErrors<Record<string, unknown>>} fieldName={name} />
      </FieldGroup>
    </div>
  )
}
