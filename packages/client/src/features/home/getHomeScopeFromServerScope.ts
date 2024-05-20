import { ServerScope, HomeScope } from './types'

const SCOPE_DICT: Record<string, HomeScope> = {
  'private': 'me',
  'public': 'everybody',
  'featured': 'featured',
  'spaces': 'spaces',
}

export function getHomeScopeFromServerScope(serverScope: ServerScope, feature: boolean): HomeScope {
  let key: string = serverScope || 'private'
  if (serverScope === 'public' && feature) {
    key = 'featured'
  } else if (serverScope.startsWith('space-')) {
    key = 'spaces'
  }

  return SCOPE_DICT[key]
}
