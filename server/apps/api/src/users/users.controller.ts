import { SqlEntityManager } from '@mikro-orm/mysql'
import { Controller, Get, Inject, Logger, UseGuards } from '@nestjs/common'
import { DEPRECATED_SQL_ENTITY_MANAGER_TOKEN } from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import { UserService } from '@shared/domain/user/user.service'
import { UserOpsCtx } from '@shared/types'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

@UseGuards(UserContextGuard)
@Controller('/users')
export class UsersController {
  constructor(
    private readonly user: UserContext,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER_TOKEN) private readonly em: SqlEntityManager,
    private readonly log: Logger,
  ) {}

  @Get('/active')
  async listActiveUserNames() {
    const opsCtx: UserOpsCtx = {
      log: this.log,
      user: this.user,
      em: this.em,
    }

    const userService = new UserService(opsCtx)

    return await userService.listActiveUserNames()
  }

  @Get('/government')
  async listGovernmentUserNames() {
    const opsCtx: UserOpsCtx = {
      log: this.log,
      user: this.user,
      em: this.em,
    }

    const userService = new UserService(opsCtx)

    return await userService.listGovernmentUserNames()
  }
}
