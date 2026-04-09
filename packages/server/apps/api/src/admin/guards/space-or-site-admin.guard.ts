import { SqlEntityManager } from '@mikro-orm/mysql'
import { CanActivate, Injectable } from '@nestjs/common'
import { User } from '@shared/domain/user/user.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { UserInvalidPermissionsError } from '@shared/errors'

@Injectable()
export class SpaceOrSiteAdminGuard implements CanActivate {
  constructor(
    private readonly user: UserContext,
    private readonly em: SqlEntityManager,
  ) {}

  async canActivate(): Promise<boolean> {
    const userFromDb = await this.em.findOneOrFail(User, { id: this.user.id })
    const isSpaceAdmin = await userFromDb.isReviewSpaceAdmin()
    const isSiteAdmin = await userFromDb.isSiteAdmin()

    if (isSpaceAdmin || isSiteAdmin) {
      return true
    }

    throw new UserInvalidPermissionsError('User requires Space or Site Admin permission to access this resource')
  }
}
