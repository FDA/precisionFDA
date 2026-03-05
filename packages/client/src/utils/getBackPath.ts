import { Location } from 'react-router'
import { HomeScope } from '@/features/home/types'

export type LocationResource = 'files' | 'apps' | 'workflows' | 'executions' | 'members' | 'discussions' | 'databases'

export function getBackPathNext({
  spaceId,
  location,
  resourceLocation,
  homeScope,
}: {
  spaceId?: number | string
  location: Location
  resourceLocation: LocationResource
  homeScope?: HomeScope
}) {
  const fromSearch = location?.state?.fromSearch ?? ''
  let backPath = ''

  if (location?.state?.from) {
    backPath = `${location?.state?.from}${fromSearch}`
  }

  if (homeScope) {
    const scopeParamLink = `?scope=${homeScope?.toLowerCase()}`
    backPath = `/home/${resourceLocation ?? ''}${scopeParamLink}`
  }

  if (spaceId) {
    backPath = `/spaces/${spaceId}/${resourceLocation}${fromSearch}`
  }

  return backPath
}
