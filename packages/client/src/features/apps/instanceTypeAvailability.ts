import { useEffect, useMemo } from 'react'
import type { FieldNamesMarkedBoolean, Path, UseFormSetValue } from 'react-hook-form'
import type { ComputeInstance, RunJobFormType } from './apps.types'
import { useComputeInstances } from './useComputeInstances'

/**
 * Helpers for validating selected compute instance types against the current user's allowed resources.
 */
export const INSTANCE_TYPE_UNAVAILABLE_MESSAGE =
  'This instance type is not available for your account. Select a different instance type from the list.'

export type AppInstanceTypeValidationContext = {
  allowedComputeResourceIds: readonly string[] | null
}

type InstanceTypeAvailabilityResult = {
  computeInstances: ComputeInstance[]
  isLoading: boolean
  allowedComputeResourceIds: readonly string[] | null
}

export function getAllowedComputeResourceIds(
  computeInstances: ComputeInstance[],
  isLoading: boolean,
): readonly string[] | null {
  return isLoading ? null : computeInstances.map(instance => instance.value)
}

export const useInstanceTypeAvailability = (): InstanceTypeAvailabilityResult => {
  const { computeInstances, isLoading } = useComputeInstances()

  const allowedComputeResourceIds = useMemo(
    () => getAllowedComputeResourceIds(computeInstances, isLoading),
    [computeInstances, isLoading],
  )

  return { computeInstances, isLoading, allowedComputeResourceIds }
}

/**
 * It returns a usable instance id (like 'baseline-8') or undefined.
 * This function hides that variability and gives one consistent key.
 *
 * getComputeInstanceSelectionKey('baseline-8') -> 'baseline-8'
 * getComputeInstanceSelectionKey({ value: 'gpu-8', label: 'GPU 8' }) -> 'gpu-8'
 * getComputeInstanceSelectionKey({ value: '' }) -> undefined
 * getComputeInstanceSelectionKey(null) -> undefined
 * @param value
 */
export function getComputeInstanceSelectionKey(value: unknown): string | undefined {
  if (value == null) return undefined
  if (typeof value === 'string') return value === '' ? undefined : value
  if (typeof value === 'object' && value !== null && 'value' in value) {
    const v = (value as { value: unknown }).value
    return typeof v === 'string' && v !== '' ? v : undefined
  }
  return undefined
}

export function getVisibleComputeInstances(
  computeInstances: ComputeInstance[],
  selectedValue: unknown,
): ComputeInstance[] {
  const selectedKey = getComputeInstanceSelectionKey(selectedValue)
  if (selectedKey == null || computeInstances.some(instance => instance.value === selectedKey)) {
    return computeInstances
  }

  const selectedLabel =
    typeof selectedValue === 'object' &&
    selectedValue !== null &&
    'label' in selectedValue &&
    typeof (selectedValue as { label: unknown }).label === 'string'
      ? (selectedValue as { label: string }).label
      : selectedKey

  return [
    {
      value: selectedKey,
      label: `${selectedLabel} (Unavailable for your account)`,
    },
    ...computeInstances,
  ]
}

/**
 * Applies the app spec default to untouched empty rows only when that default is available.
 */
export const useApplyDefaultRunJobInstanceTypes = (
  inputs: RunJobFormType['inputs'] | undefined,
  computeInstances: ComputeInstance[],
  isLoading: boolean,
  specInstanceType: string,
  setValue: UseFormSetValue<RunJobFormType>,
  dirtyFields: FieldNamesMarkedBoolean<RunJobFormType>,
) => {
  const defaultInstance = useMemo(
    () => computeInstances.find(instance => instance.value === specInstanceType) ?? null,
    [computeInstances, specInstanceType],
  )

  useEffect(() => {
    if (isLoading) return

    const rows = inputs ?? []

    rows.forEach((row, index) => {
      const path = `inputs.${index}.instanceType` as Path<RunJobFormType>
      const key = getComputeInstanceSelectionKey(row?.instanceType)

      if (key) return

      if (dirtyFields?.inputs?.[index]?.instanceType) return

      if (defaultInstance == null) return

      setValue(path, defaultInstance, { shouldDirty: false, shouldValidate: true })
    })
  }, [inputs, defaultInstance, dirtyFields?.inputs, isLoading, setValue])
}
