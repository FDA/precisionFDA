import { SqlEntityManager } from '@mikro-orm/mysql'
import { CanActivate, Injectable, Logger } from '@nestjs/common'
import { User } from '@shared/domain/user/user.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { UnauthorizedRequestError } from '@shared/errors'

@Injectable()
export class UserContextGuard implements CanActivate {
  constructor(
    private readonly logger: Logger,
    private readonly user: UserContext,
    private readonly em: SqlEntityManager,
  ) {}

  public async canActivate(): Promise<boolean> {
    if (!this.user.id || !this.user.dxuser || !this.user.accessToken) {
      throw new UnauthorizedRequestError()
    }

    const userFromDb = await this.em.findOne(User, { id: this.user.id, dxuser: this.user.dxuser })
    if (userFromDb) {
      return true
    }

    this.logger.error(`User not found in the database: ${this.user.id}, ${this.user.dxuser}`)
    throw new UnauthorizedRequestError()
  }
}
