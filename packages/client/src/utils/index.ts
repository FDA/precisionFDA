import { APIResource } from '../features/home/types'

export function getSpaceIdFromScope(scope?: string) {
  if (!scope) return undefined
  const [resource, id] = scope.split('-')
  if (resource !== 'space') return undefined
  return parseInt(id, 10) || undefined
}

export function createSequenceGenerator() {
  function* generator() {
    let index = 0
    while (true) {
      yield index++
    }
  }
  return generator()
}

// Used to create a key for persisting items into localstorage.
export type LocationKey = `${string}-${APIResource}`
export function createLocationKey(resource: APIResource, spaceId?: number | string): LocationKey {
  return `${spaceId ? `space-${spaceId}` : 'home'}-${resource}`
}
