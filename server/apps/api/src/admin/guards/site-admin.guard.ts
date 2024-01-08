import { SqlEntityManager } from '@mikro-orm/mysql'
import { CanActivate, Injectable } from '@nestjs/common'
import { User } from '@shared/domain/user/user.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { UserInvalidPermissionsError } from '@shared/errors'

@Injectable()
export class SiteAdminGuard implements CanActivate {
  constructor(
    private readonly user: UserContext,
    private readonly em: SqlEntityManager,
  ) {}

  async canActivate() {
    const userFromDb = await this.em.findOneOrFail(User, { id: this.user.id })
    const isSiteAdmin = await userFromDb.isSiteAdmin()

    if (isSiteAdmin) {
      return true
    }

    throw new UserInvalidPermissionsError(
      'User requires Site Admin permission to access this resource',
    )
  }
}
