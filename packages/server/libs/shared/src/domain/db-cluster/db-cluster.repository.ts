import { DbCluster } from './db-cluster.entity'
import { AccessControlRepository } from '@shared/database/repository/access-control.repository'
import { FilterQuery } from '@mikro-orm/core'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'

export class DbClusterRepository extends AccessControlRepository<DbCluster> {
  protected async getAccessibleWhere(): Promise<FilterQuery<DbCluster>> {
    const user = await this.em.findOneOrFail(User, { id: this.user.id })
    const accessibleSpaces = await user.accessibleSpaces()
    const scopes = accessibleSpaces.map(space => space.scope)

    return {
      $or: [{ user: user.id, scope: STATIC_SCOPE.PRIVATE }, { scope: { $in: scopes } }],
    }
  }

  protected async getEditableWhere(): Promise<FilterQuery<DbCluster>> {
    const user = await this.em.findOneOrFail(User, { id: this.user.id })
    const accessibleSpaces = await user.editableSpaces()
    const scopes = accessibleSpaces.map(space => space.scope)

    // TODO PFDA-6222: define rules for site-admins

    return {
      $or: [{ user: user.id, scope: STATIC_SCOPE.PRIVATE }, { scope: { $in: scopes } }],
    }
  }
}
