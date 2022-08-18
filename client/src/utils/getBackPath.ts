import { Location } from "../types/utils"

export type LocationResource = 'files' | 'apps' | 'workflows' | 'executions' | 'members'

const backLocations = ['home', 'spaces']

export function getBackPath(location: Location, resourceLocation?: LocationResource) {
  const { pathname, state } = location
  
  const backLocation = backLocations.find(backLocation => pathname.includes(backLocation))

  let backPath = ''
  if(state?.from) {
    backPath = location?.state?.from
  } else {
    backPath = `/${backLocation}/${resourceLocation || ''}`
  }

  backPath = backPath + location?.state?.fromSearch || ''

  return backPath
}
