import { type Control, Controller, type FieldErrors, type Path } from 'react-hook-form'
import { FieldGroup } from '@/components/form/FieldGroup'
import { Loader } from '@/components/Loader'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { type ComputeResourceKey, ComputeResourcePricingMap } from '@/types/user'
import { cn } from '@/utils/cn'
import type { ComputeInstance, RunJobFormType } from '../apps.types'
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
  selectedInstance: ComputeInstance | undefined
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
    <div className="w-full min-w-0 max-w-64">
      <FieldGroup label="Instance Type" required>
        <Controller
          name={name}
          control={control}
          render={({ field }) => {
            if (isComputeInstancesLoading) {
              return <Loader />
            }
            const current = field.value as ComputeInstance | undefined
            return (
              <>
                <Select
                  id={inputId}
                  name={String(field.name)}
                  items={computeInstances}
                  value={current?.value ?? null}
                  onValueChange={id => {
                    const next = computeInstances.find(c => c.value === id)
                    if (next) {
                      field.onChange(next)
                    }
                    field.onBlur()
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    className={cn('h-8 w-full min-w-0 max-w-full justify-between pr-1 pl-1.5')}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  >
                    <SelectValue placeholder="Choose…" />
                  </SelectTrigger>
                  <SelectContent>
                    {computeInstances.map(option => (
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
