import { SqlEntityManager } from '@mikro-orm/mysql'
import { Body, Controller, HttpCode, Inject, Logger, Post } from '@nestjs/common'
import { DEPRECATED_SQL_ENTITY_MANAGER } from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import {
  ChallengeProposeInput,
  ChallengeProposeOperation,
} from '@shared/domain/challenge/ops/propose-challenge'
import { UserOpsCtx } from '@shared/types'
import { UserContext } from '@shared/domain/user-context/model/user-context'

@Controller('/challenges')
export class ChallengeController {
  constructor(
    private readonly user: UserContext,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER) private readonly em: SqlEntityManager,
    private readonly logger: Logger,
  ) {}

  @HttpCode(204)
  @Post()
  async propose(@Body() body: ChallengeProposeInput) {
    const opsCtx: UserOpsCtx = {
      log: this.logger,
      user: this.user,
      em: this.em,
    }

    await new ChallengeProposeOperation(opsCtx).execute(body)
  }
}
