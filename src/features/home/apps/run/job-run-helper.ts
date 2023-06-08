import { getSpaceIdFromScope } from '../../../../utils'
import { ISpace, SPACE_TYPES } from '../../../spaces/spaces.types'
import { fetchSelectableSpaces } from '../apps.api'

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

const fetchAndConvertSelectableSpaces = async (
  scope: string,
): Promise<
  {
    isDisabled: boolean
    label: string
    value: string
  }[]
> => {
  if (scope.includes('space')) {
    const spaceId = getSpaceIdFromScope(scope)
    const spaces: ISpace[] = await fetchSelectableSpaces(spaceId)
    return spaces.map(space => ({
      isDisabled: false,
      label: getTitle(space),
      value: space.id,
    }))
  }
  return []
}

export { fetchAndConvertSelectableSpaces }