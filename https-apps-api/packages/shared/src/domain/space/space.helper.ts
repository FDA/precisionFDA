import { defaultLogger as log } from '../../logger'
import { InternalError } from '../../errors'

const getIdFromScopeName = (name: string): number => {
  const [prefix, id] = name.split('-')
  if (prefix !== 'space') {
    throw new InternalError('Scope space name has to start with "space" prefix')
  }
  const idValue = parseInt(id)
  if (isNaN(idValue) || idValue <= 0) {
    throw new InternalError('Invalid id number value')
  }
  return idValue
}

const getScopeFromSpaceId = (spaceId: number): string => {
  return `space-${spaceId}`
}

const isValidScopeName = (name: string): boolean => {
  try {
    getIdFromScopeName(name)
    return true
  } catch (err) {
    log.debug({ scopeName: name }, 'Invalid scope name provided, error swallowed')
    return false
  }
}

export { isValidScopeName, getIdFromScopeName, getScopeFromSpaceId }
