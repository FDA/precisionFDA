import { FilterQuery } from '@mikro-orm/core'
import { AccessControlRepository } from '@shared/database/repository/access-control.repository'
import { License } from '@shared/domain/license/license.entity'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'

export class LicenseRepository extends AccessControlRepository<License> {
  protected async getAccessibleWhere(): Promise<FilterQuery<License>> {
    const user = await this.em.findOneOrFail(User, { id: this.user.id })
    const accessibleSpaces = await user.accessibleSpaces()
    const spaceScopes = accessibleSpaces.map((space: { id: number }) => `space-${space.id}`)

    return {
      $or: [
        { user: this.user.id, scope: STATIC_SCOPE.PRIVATE },
        { scope: { $in: [STATIC_SCOPE.PUBLIC, ...spaceScopes] } },
      ],
    }
  }

  protected async getEditableWhere(): Promise<FilterQuery<License>> {
    return { user: this.user.id }
  }
}
