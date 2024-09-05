import { getSpaceIdFromScope } from '../../../utils'
import { EditableSpace, fetchEditableSpacesList } from '../../spaces/spaces.api'
import { ISpace, SPACE_TYPES } from '../../spaces/spaces.types'
import { fetchSelectableSpaces } from '../apps.api'
import { IApp, SelectableSpace, SelectType } from '../apps.types'

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

const fetchAndConvertSelectableSpaces = async (scope: string): Promise<SelectableSpace[]> => {
  if (scope.includes('space')) {
    const spaceId = getSpaceIdFromScope(scope)
    if (spaceId) {
      const spaces: ISpace[] = await fetchSelectableSpaces(spaceId.toString())
      return spaces.map(space => ({
        isDisabled: false,
        label: getTitle(space),
        value: `space-${space.id}`,
      }))
    }
  }
  return []
}

const fetchAndConvertSelectableContexts = async (entity_type: IApp['entity_type']): Promise<
  SelectType[]
> => {
  if (entity_type === 'https') {
    const spaces: EditableSpace[] = await fetchEditableSpacesList()
    const options = spaces.map(s => ({
      label: `${s.title} - ${s.scope}`,
      value: s.scope,
    }))

    return [{ label: 'Private', value: 'private' }, ...options]
  }
  return []
}

export { fetchAndConvertSelectableContexts, fetchAndConvertSelectableSpaces }
