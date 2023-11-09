import { Location } from '../types/utils'
import { ResourceScope } from '../features/home/types'

export type LocationResource = 'files' | 'apps' | 'workflows' | 'executions' | 'members' | 'discussions'

export function getBackPath(
  location: Location,
  resourceLocation?: LocationResource,
  scope: ResourceScope = 'me',
) {
  const { state } = location
  const fromSearch = location?.state?.fromSearch ?? ''
  let backPath = ''
  if(state?.from) {
    // access from a space, or switching scope
    backPath = `${location?.state?.from}${fromSearch}`
  } else {
    const scopeParamLink = `?scope=${scope?.toLowerCase()}`
    backPath = `/home/${resourceLocation ?? ''}${scopeParamLink}`
  }

  return backPath
}
