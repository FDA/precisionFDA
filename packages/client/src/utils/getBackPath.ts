import { Location } from 'react-router-dom'
import { HomeScope } from '../features/home/types'

export type LocationResource = 'files' | 'apps' | 'workflows' | 'executions' | 'members' | 'discussions'

export function getBackPath(
  location: Location,
  resourceLocation?: LocationResource,
  homeScope: HomeScope = 'me',
) {
  const { state } = location
  const fromSearch = location?.state?.fromSearch ?? ''
  let backPath = ''
  if(state?.from) {
    // access from a space, or switching scope
    backPath = `${location?.state?.from}${fromSearch}`
  } else {
    const scopeParamLink = `?scope=${homeScope?.toLowerCase()}`
    backPath = `/home/${resourceLocation ?? ''}${scopeParamLink}`
  }

  return backPath
}

export function getBackPathNext({
  spaceId,
  location,
  resourceLocation,
  homeScope,
}: {
  spaceId?: number,
  location: Location
  resourceLocation: LocationResource
  homeScope?: HomeScope
}) {
  const fromSearch = location?.state?.fromSearch ?? ''
  let backPath = ''

  if(location?.state?.from) {
    backPath = `${location?.state?.from}${fromSearch}`
  }

  if(homeScope) {
    const scopeParamLink = `?scope=${homeScope?.toLowerCase()}`
    backPath = `/home/${resourceLocation ?? ''}${scopeParamLink}`
  }

  if(spaceId) {
    backPath = `/spaces/${spaceId}/${resourceLocation}${fromSearch}`
  }

  return backPath
}
