import { SqlEntityManager } from '@mikro-orm/mysql'
import { Body, Controller, HttpCode, Inject, Logger, Post } from '@nestjs/common'
import { challenge, DEPRECATED_SQL_ENTITY_MANAGER_TOKEN, UserContext } from '@shared'
import { ChallengeProposeInput } from '@shared/domain/challenge/ops/propose-challenge'
import { UserOpsCtx } from '@shared/types'

@Controller('/challenges')
export class ChallengeController {
  constructor(
    private readonly user: UserContext,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER_TOKEN) private readonly em: SqlEntityManager,
    private readonly log: Logger,
  ) {}

  @HttpCode(204)
  @Post()
  async propose(@Body() body: ChallengeProposeInput) {
    const opsCtx: UserOpsCtx = {
      log: this.log,
      user: this.user,
      em: this.em,
    }

    await new challenge.ChallengeProposeOperation(opsCtx).execute(body)
  }
}
