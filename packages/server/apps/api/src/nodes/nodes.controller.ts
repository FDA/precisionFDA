import { SqlEntityManager } from '@mikro-orm/mysql'
import { Body, Controller, Delete, HttpCode, Inject, Logger, Post, UseGuards } from '@nestjs/common'
import { DEPRECATED_SQL_ENTITY_MANAGER } from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import { NodesInputDTO } from '@shared/domain/user-file/dto/nodes-input.dto'
import { RequestNodesLockOperation } from '@shared/domain/user-file/ops/start-lock-nodes-job'
import { RequestNodesUnlockOperation } from '@shared/domain/user-file/ops/start-unlock-nodes-job'
import { UserOpsCtx } from '@shared/types'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { RemoveNodesFacade } from '@shared/facade/node-remove/remove-nodes.facade'
import { LockNodeFacade } from '@shared/facade/node-lock/lock-node.facade'
import { UnlockNodeFacade } from '@shared/facade/node-unlock/unlock-node.facade'

@UseGuards(UserContextGuard)
@Controller('/nodes')
export class NodesController {
  constructor(
    private readonly user: UserContext,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER) private readonly em: SqlEntityManager,
    private readonly logger: Logger,
    private readonly removeNodesFacade: RemoveNodesFacade,
    private readonly lockNodeFacade: LockNodeFacade,
    private readonly unlockNodeFacade: UnlockNodeFacade,
  ) {}

  @HttpCode(204)
  @Post('/lock')
  async lockNodes(@Body() input: NodesInputDTO): Promise<void> {
    const opsCtx: UserOpsCtx = {
      log: this.logger,
      user: this.user,
      em: this.em,
    }

    const { ids, async } = input

    if (async) {
      await new RequestNodesLockOperation(opsCtx).execute({ ids })
    } else {
      await this.lockNodeFacade.lockNodes(ids, async)
    }
  }

  @HttpCode(204)
  @Post('/unlock')
  async unlockNodes(@Body() input: NodesInputDTO): Promise<void> {
    const opsCtx: UserOpsCtx = {
      log: this.logger,
      user: this.user,
      em: this.em,
    }

    const { ids, async } = input

    if (async) {
      await new RequestNodesUnlockOperation(opsCtx).execute({ ids })
    } else {
      await this.unlockNodeFacade.unlockNodes(ids, async)
    }
  }

  @Delete('/remove')
  async removeNodes(@Body() input: NodesInputDTO): Promise<number> {
    const { ids, async } = input

    if (async) {
      await this.removeNodesFacade.removeNodesAsync(ids)
    } else {
      const res = await this.removeNodesFacade.removeNodes(ids)
      return res.removedFoldersCount + res.removedFilesCount
    }
  }
}
