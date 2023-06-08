import { ServerScope, ResourceScope } from './types'

const SCOPE_DICT: Record<string, ResourceScope> = {
  'private': 'me',
  'public': 'everybody',
  'featured': 'featured',
  'spaces': 'spaces',
}

export function getScopeMapping(scope: ServerScope, feature: boolean): ResourceScope {
  let key: string = scope || 'private'
  if (scope === 'public' && feature) {
    key = 'featured'
  } else if (scope.startsWith('space-')) {
    key = 'spaces'
  }

  return SCOPE_DICT[key]
}
