import { FilterQuery } from '@mikro-orm/mysql'
import { DxId } from '../entity/domain/dxid'
import { App } from './app.entity'
import { ENTITY_TYPE } from './app.enum'
import { AccessControlRepository } from '@shared/repository/access-control.repository'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'

export class AppRepository extends AccessControlRepository<App> {
  protected async getAccessibleWhere(): Promise<FilterQuery<App>> {
    const user = await this.em.findOneOrFail(User, { id: this.user.id })
    const accessibleSpaces = await user.accessibleSpaces()
    const scopes = accessibleSpaces.map((space) => space.scope)

    return {
      $or: [
        { user: user.id, scope: STATIC_SCOPE.PRIVATE },
        { scope: STATIC_SCOPE.PUBLIC },
        { scope: { $in: scopes } },
      ],
    }
  }

  protected async getEditableWhere(): Promise<FilterQuery<App>> {
    const user = await this.em.findOneOrFail(User, { id: this.user.id })
    const editableSpaces = await user.editableSpaces()
    const scopes = editableSpaces.map((space) => space.scope)

    // TODO PFDA-6222: define rules for site-admins

    return {
      $or: [
        { user: user.id, scope: STATIC_SCOPE.PRIVATE },
        { scope: STATIC_SCOPE.PUBLIC, user: user.id },
        { scope: { $in: scopes } },
      ],
    }
  }

  async findPublic(dxid: DxId<'app'>) {
    return await this.findOne({
      dxid,
      scope: 'public',
      entityType: ENTITY_TYPE.HTTPS,
      // todo: only of admin user
    })
  }
}
