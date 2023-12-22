import { SqlEntityManager } from '@mikro-orm/mysql'
import { CanActivate, Injectable } from '@nestjs/common'
import { entities, errors, UserContext } from '@shared'

@Injectable()
export class SiteAdminGuard implements CanActivate {
  constructor(
    private readonly user: UserContext,
    private readonly em: SqlEntityManager,
  ) {}

  async canActivate() {
    const userFromDb = await this.em.findOneOrFail(entities.User, { id: this.user.id })
    const isSiteAdmin = await userFromDb.isSiteAdmin()

    if (isSiteAdmin) {
      return true
    }

    throw new errors.UserInvalidPermissionsError(
      'User requires Site Admin permission to access this resource',
    )
  }
}
