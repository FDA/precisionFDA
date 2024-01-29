import { SqlEntityManager } from '@mikro-orm/mysql'
import { Body, Controller, Delete, HttpCode, Inject, Logger, Post, UseGuards } from '@nestjs/common'
import { DEPRECATED_SQL_ENTITY_MANAGER } from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import { NodesLockOperation } from '@shared/domain/user-file/ops/node-lock'
import { NodesUnlockOperation } from '@shared/domain/user-file/ops/node-unlock'
import { NodesRemoveOperation } from '@shared/domain/user-file/ops/nodes-remove'
import { RequestNodesLockOperation } from '@shared/domain/user-file/ops/start-lock-nodes-job'
import { StartRemoveNodesJob } from '@shared/domain/user-file/ops/start-remove-nodes-job'
import { RequestNodesUnlockOperation } from '@shared/domain/user-file/ops/start-unlock-nodes-job'
import { NodesInput, nodesSchema } from '@shared/domain/user-file/user-file.input'
import { UserOpsCtx } from '@shared/types'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { JsonSchemaPipe } from '../validation/pipes/json-schema.pipe'

@UseGuards(UserContextGuard)
@Controller('/nodes')
export class NodesController {
  constructor(
    private readonly user: UserContext,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER) private readonly em: SqlEntityManager,
    private readonly log: Logger,
  ) {}

  @HttpCode(204)
  @Post('/lock')
  async lockNodes(@Body(new JsonSchemaPipe(nodesSchema)) body: NodesInput) {
    const opsCtx: UserOpsCtx = {
      log: this.log,
      user: this.user,
      em: this.em,
    }

    const { ids, async } = body

    if (async) {
      await new RequestNodesLockOperation(opsCtx).execute({ ids })
    } else {
      await new NodesLockOperation(opsCtx).execute({ ids, async })
    }
  }

  @HttpCode(204)
  @Post('/unlock')
  async unlockNodes(@Body(new JsonSchemaPipe(nodesSchema)) body: NodesInput) {
    const opsCtx: UserOpsCtx = {
      log: this.log,
      user: this.user,
      em: this.em,
    }

    const { ids, async } = body

    if (async) {
      await new RequestNodesUnlockOperation(opsCtx).execute({ ids })
    } else {
      await new NodesUnlockOperation(opsCtx).execute({ ids, async })
    }
  }

  @Delete('/remove')
  async removeNodes(@Body(new JsonSchemaPipe(nodesSchema)) body: NodesInput) {
    const opsCtx: UserOpsCtx = {
      log: this.log,
      user: this.user,
      em: this.em,
    }

    const { ids, async } = body

    if (async) {
      await new StartRemoveNodesJob(opsCtx).execute({ ids })
    } else {
      return await new NodesRemoveOperation({ ...opsCtx, em: opsCtx.em.fork() }).execute({
        ids,
        async,
      })
    }
  }
}
