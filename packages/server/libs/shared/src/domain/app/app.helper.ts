import { scopeContainsId } from '../space/space.helper'

export const constructDxid = (username: string, appName: string, scope?: string): string => {
  return `app-${constructDxname(username, appName, scope)}`
}

export const constructDxname = (username: string, appName: string, scope?: string): string => {
  if (scope && scopeContainsId(scope)) {
    return `${scope}-${appName}`
  } else {
    return `${username}-${appName}`
  }
}
