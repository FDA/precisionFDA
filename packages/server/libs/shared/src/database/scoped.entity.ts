import { Property } from '@mikro-orm/core'
import { BaseEntity } from '@shared/database/base.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { EntityScope } from '@shared/types/common'

/**
 * Base class for all entities that are scoped.
 */
export abstract class ScopedEntity extends BaseEntity {
  @Property()
  scope: EntityScope

  isInSpace(): boolean {
    return /^space-\d+$/.test(this.scope)
  }

  getSpaceId(): number {
    if (!this.isInSpace()) {
      throw new Error('Entity is not in a space')
    }
    return parseInt(this.scope.replace('space-', ''), 10)
  }

  isPublic(): boolean {
    return this.scope === STATIC_SCOPE.PUBLIC
  }

  isPrivate(): boolean {
    return this.scope === STATIC_SCOPE.PRIVATE
  }
}
