import { useMemo } from 'react'
import { useAuthUser } from '@/features/auth/useAuthUser'
import { ComputeResourcePricingMap, isComputeResource, RESOURCE_LABELS } from '@/types/user'
import { ComputeInstance } from './apps.types'

export const useComputeInstances = (): { computeInstances: ComputeInstance[]; isLoading: boolean } => {
  const { user, loading } = useAuthUser(true)

  const computeInstances = useMemo(() => {
    if (!user) return []
    return user.resources.filter(isComputeResource).map(r => ({
      value: r,
      label: `${RESOURCE_LABELS[r]}\xa0 \u2014 \xa0$${ComputeResourcePricingMap[r]}\xa0/\xa0hour`,
    }))
  }, [user])

  return { computeInstances, isLoading: loading }
}
