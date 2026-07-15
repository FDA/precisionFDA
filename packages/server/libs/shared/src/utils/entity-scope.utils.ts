import { Space } from '@shared/domain/space/space.entity'
import { EntityScope, SpaceScope, StaticScope } from '@shared/types/common'

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

  static getScopeFromSpaceId(spaceId: number): SpaceScope {
    return `space-${spaceId}` as SpaceScope
  }

  static isPrivate(scope: EntityScope): scope is 'private' {
    return scope === 'private'
  }

  static isPublic(scope: EntityScope): scope is 'public' {
    return scope === 'public'
  }

  static computeLocation(scope: EntityScope, space?: Space): string {
    let location: string = ''
    const staticLocations: Record<StaticScope, string> = {
      private: 'Private',
      public: 'Public',
    }
    location = staticLocations[scope]
    if (!location && space) {
      const suffix = space.isConfidential() ? 'Private' : 'Shared'
      location = `${space.name} - ${suffix}`
    }
    return location
  }
}
