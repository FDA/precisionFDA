import { Location } from '../types/utils'

export type LocationResource = 'files' | 'apps' | 'workflows' | 'executions' | 'members'

const backLocations = ['home', 'spaces']

export function getBackPath(location: Location, resourceLocation?: LocationResource, spaceId?: string) {
  const { pathname, state } = location
  const backLocation = backLocations.find(loca => pathname.includes(loca))
  const back = backLocation === 'spaces' ? `spaces/${spaceId}` : 'home'
  const fromSearch = location?.state?.fromSearch ?? ''
  let backPath = ''
  if(state?.from) {
    backPath = `${location?.state?.from}${fromSearch}`
  } else {
    backPath = `/${back}/${resourceLocation ?? ''}`
  }

  return backPath
}
