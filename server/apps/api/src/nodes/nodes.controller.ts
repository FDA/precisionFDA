import { SqlEntityManager } from '@mikro-orm/mysql'
import { Body, Controller, Delete, HttpCode, Inject, Logger, Post, UseGuards } from '@nestjs/common'
import { DEPRECATED_SQL_ENTITY_MANAGER_TOKEN, UserContext, userFile } from '@shared'
import { NodesInput } from '@shared/domain/user-file/user-file.input'
import { UserOpsCtx } from '@shared/types'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { JsonSchemaPipe } from '../validation/pipes/json-schema.pipe'

@UseGuards(UserContextGuard)
@Controller('/nodes')
export class NodesController {
  constructor(
    private readonly user: UserContext,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER_TOKEN) private readonly em: SqlEntityManager,
    private readonly log: Logger,
  ) {}

  @HttpCode(204)
  @Post('/lock')
  async lockNodes(@Body(new JsonSchemaPipe(userFile.inputs.nodesSchema)) body: NodesInput) {
    const opsCtx: UserOpsCtx = {
      log: this.log,
      user: this.user,
      em: this.em,
    }

    const { ids, async } = body

    if (async) {
      await new userFile.RequestNodesLockOperation(opsCtx).execute({ ids })
    } else {
      await new userFile.NodesLockOperation(opsCtx).execute({ ids, async })
    }
  }

  @HttpCode(204)
  @Post('/unlock')
  async unlockNodes(@Body(new JsonSchemaPipe(userFile.inputs.nodesSchema)) body: NodesInput) {
    const opsCtx: UserOpsCtx = {
      log: this.log,
      user: this.user,
      em: this.em,
    }

    const { ids, async } = body

    if (async) {
      await new userFile.RequestNodesUnlockOperation(opsCtx).execute({ ids })
    } else {
      await new userFile.NodesUnlockOperation(opsCtx).execute({ ids, async })
    }
  }

  @Delete('/remove')
  async removeNodes(@Body(new JsonSchemaPipe(userFile.inputs.nodesSchema)) body: NodesInput) {
    const opsCtx: UserOpsCtx = {
      log: this.log,
      user: this.user,
      em: this.em,
    }

    const { ids, async } = body

    if (async) {
      await new userFile.StartRemoveNodesJob(opsCtx).execute({ ids })
    } else {
      return await new userFile.NodesRemoveOperation({ ...opsCtx, em: opsCtx.em.fork() }).execute({
        ids,
        async,
      })
    }
  }
}
