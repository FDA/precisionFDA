import { SqlEntityManager } from '@mikro-orm/mysql'
import { Body, Controller, HttpCode, Inject, Logger, Post, UseGuards } from '@nestjs/common'
import { DEPRECATED_SQL_ENTITY_MANAGER } from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import {
  CreateDbClusterInput,
  createDbClusterSchema,
} from '@shared/domain/db-cluster/db-cluster.input'
import { CreateDbClusterOperation } from '@shared/domain/db-cluster/ops/create'
import { StartDbClusterOperation } from '@shared/domain/db-cluster/ops/start'
import { StopDbClusterOperation } from '@shared/domain/db-cluster/ops/stop'
import { TerminateDbClusterOperation } from '@shared/domain/db-cluster/ops/terminate'
import { UserOpsCtx } from '@shared/types'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { schemas } from '@shared/utils/base-schemas'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { JsonSchemaPipe } from '../validation/pipes/json-schema.pipe'

interface IDxidListParams {
  dxids: string[]
}

@UseGuards(UserContextGuard)
@Controller('/dbclusters')
export class DbClusterController {
  constructor(
    private readonly user: UserContext,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER) private readonly em: SqlEntityManager,
    private readonly log: Logger,
  ) {}

  @HttpCode(204)
  @Post('/start')
  async startDbCluster(
    @Body(new JsonSchemaPipe(schemas.getDxidsInputSchema('dxids'))) body: IDxidListParams,
  ) {
    const opsCtx: UserOpsCtx = {
      log: this.log,
      user: this.user,
      em: this.em,
    }

    await Promise.all(
      body.dxids.map(async (dxid) => {
        return await new StartDbClusterOperation(opsCtx).execute({
          dxid,
        })
      }),
    )
  }

  @HttpCode(204)
  @Post('/stop')
  async stopDbCluster(
    @Body(new JsonSchemaPipe(schemas.getDxidsInputSchema('dxids'))) body: IDxidListParams,
  ) {
    const opsCtx: UserOpsCtx = {
      log: this.log,
      user: this.user,
      em: this.em,
    }

    await Promise.all(
      body.dxids.map(async (dxid) => {
        return await new StopDbClusterOperation(opsCtx).execute({
          dxid,
        })
      }),
    )
  }

  @HttpCode(204)
  @Post('/terminate')
  async terminateDbCluster(
    @Body(new JsonSchemaPipe(schemas.getDxidsInputSchema('dxids'))) body: IDxidListParams,
  ) {
    const opsCtx: UserOpsCtx = {
      log: this.log,
      user: this.user,
      em: this.em,
    }

    await Promise.all(
      body.dxids.map(async (dxid) => {
        return await new TerminateDbClusterOperation(opsCtx).execute({
          dxid,
        })
      }),
    )
  }

  @HttpCode(201)
  @Post('/create')
  async createDbCluster(
    @Body(new JsonSchemaPipe(createDbClusterSchema))
    body: CreateDbClusterInput,
  ) {
    const opsCtx: UserOpsCtx = {
      log: this.log,
      user: this.user,
      em: this.em,
    }

    return await new CreateDbClusterOperation(opsCtx).execute(body)
  }
}
