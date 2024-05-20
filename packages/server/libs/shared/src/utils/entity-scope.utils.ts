import { SpaceScope } from '@shared/types/common'

export class EntityScopeUtils {
  static isSpaceScope(scope: string): scope is SpaceScope {
    const parts = scope?.split('-')

    if (parts?.length !== 2) {
      return false
    }

    if (parts[0] !== 'space') {
      return false
    }

    return Number.isInteger(Number(parts[1]))
  }

  static getSpaceIdFromScope(scope: SpaceScope): number {
    return Number(scope.split('-')[1])
  }
}
