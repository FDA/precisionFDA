import { BaseEntity } from '@shared/database/base.entity'
import { EntityScope } from '@shared/types/common'
import { Property } from '@mikro-orm/core'
import { STATIC_SCOPE } from '@shared/enums'

/**
 * Base class for all entities that are scoped.
 */
export abstract class ScopedEntity extends BaseEntity {
  @Property()
  scope: EntityScope

  isInSpace() {
    return /^space-\d+$/.test(this.scope)
  }

  getSpaceId() {
    if (!this.isInSpace()) {
      throw new Error('Entity is not in a space')
    }
    return parseInt(this.scope.replace('space-', ''))
  }

  isPublic() {
    return this.scope === STATIC_SCOPE.PUBLIC
  }

  isPrivate() {
    return this.scope === STATIC_SCOPE.PRIVATE
  }
}
