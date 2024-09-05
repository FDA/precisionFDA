import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { getSpaceIdFromScope } from '../../../utils'
import { fetchEditableSpacesList } from '../../spaces/spaces.api'
import { ISpace, SPACE_TYPES } from '../../spaces/spaces.types'
import { fetchSelectableSpaces } from '../apps.api'
import { IApp } from '../apps.types'

const getTitle = (space: ISpace): string => {
  if (space.type === SPACE_TYPES.REVIEW) {
    return space.spaceId
      ? `${space.name} (Private Review)`
      : `${space.name} (Shared Review)`
  }
  if (space.type === SPACE_TYPES.VERIFICATION) {
    return `${space.name} (Verification)`
  }
  if (space.type === SPACE_TYPES.GROUPS) {
    return `${space.name} (Group)`
  }
  if (space.type === SPACE_TYPES.PRIVATE_TYPE) {
    return `${space.name} (Private)`
  }
  return space.name
}

export const fetchAndConvertSelectableContexts = (scope: IApp['scope'], entityType: IApp['entity_type']) => useQuery({
  queryKey: ['selectable-context', scope],
  queryFn: () => fetchEditableSpacesList(),
  select: (data) => {
    if (entityType === 'https') {
      const options = data.map(s => ({
        label: `${s.title} - ${s.scope}`,
        value: s.scope,
      }))

      return [{ label: 'Private', value: 'private' }, ...options]
    }
    return []
  },
})

export const fetchAndConvertSelectableSpaces = (scope: IApp['scope']) => {
  const spaceId = getSpaceIdFromScope(scope)
  return useQuery({
    queryKey: ['selectable-space', scope],
    queryFn: () => fetchSelectableSpaces(spaceId),
    select: (data) => {
      if (scope.includes('space')) {
        return data.map(space => ({
          isDisabled: false,
          label: getTitle(space),
          value: `space-${space.id}`,
        }))
      }
      return []
    },
  })
}
