import { SqlEntityManager } from '@mikro-orm/mysql'
import { Body, Controller, Delete, HttpCode, Inject, Logger, Post, UseGuards } from '@nestjs/common'
import { DEPRECATED_SQL_ENTITY_MANAGER } from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import { NodesInputDTO } from '@shared/domain/user-file/dto/nodes-input.dto'
import { NodesLockOperation } from '@shared/domain/user-file/ops/node-lock'
import { NodesUnlockOperation } from '@shared/domain/user-file/ops/node-unlock'
import { RequestNodesLockOperation } from '@shared/domain/user-file/ops/start-lock-nodes-job'
import { StartRemoveNodesJob } from '@shared/domain/user-file/ops/start-remove-nodes-job'
import { RequestNodesUnlockOperation } from '@shared/domain/user-file/ops/start-unlock-nodes-job'
import { UserOpsCtx } from '@shared/types'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { UserFileService } from '@shared/domain/user-file/service/user-file.service'

@UseGuards(UserContextGuard)
@Controller('/nodes')
export class NodesController {
  constructor(
    private readonly user: UserContext,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER) private readonly em: SqlEntityManager,
    private readonly logger: Logger,
    private readonly userFileService: UserFileService,
  ) {}

  @HttpCode(204)
  @Post('/lock')
  async lockNodes(@Body() input: NodesInputDTO) {
    const opsCtx: UserOpsCtx = {
      log: this.logger,
      user: this.user,
      em: this.em,
    }

    const { ids, async } = input

    if (async) {
      await new RequestNodesLockOperation(opsCtx).execute({ ids })
    } else {
      await new NodesLockOperation(opsCtx).execute({ ids, async })
    }
  }

  @HttpCode(204)
  @Post('/unlock')
  async unlockNodes(@Body() input: NodesInputDTO) {
    const opsCtx: UserOpsCtx = {
      log: this.logger,
      user: this.user,
      em: this.em,
    }

    const { ids, async } = input

    if (async) {
      await new RequestNodesUnlockOperation(opsCtx).execute({ ids })
    } else {
      await new NodesUnlockOperation(opsCtx).execute({ ids, async })
    }
  }

  @Delete('/remove')
  async removeNodes(@Body() input: NodesInputDTO) {
    const opsCtx: UserOpsCtx = {
      log: this.logger,
      user: this.user,
      em: this.em,
    }

    const { ids, async } = input

    if (async) {
      await new StartRemoveNodesJob(opsCtx).execute({ ids })
    } else {
      return await this.userFileService.removeNodes(ids, async)
    }
  }
}
