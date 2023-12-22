import { SqlEntityManager } from '@mikro-orm/mysql'
import { Body, Controller, HttpCode, Inject, Logger, Post, UseGuards } from '@nestjs/common'
import {
  dbCluster as dbClusterDomain,
  DEPRECATED_SQL_ENTITY_MANAGER_TOKEN,
  UserContext,
  utils,
} from '@shared'
import { CreateDbClusterInput } from '@shared/domain/db-cluster/db-cluster.input'
import { UserOpsCtx } from '@shared/types'
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
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER_TOKEN) private readonly em: SqlEntityManager,
    private readonly log: Logger,
  ) {}

  @HttpCode(204)
  @Post('/start')
  async startDbCluster(
    @Body(new JsonSchemaPipe(utils.schemas.getDxidsInputSchema('dxids'))) body: IDxidListParams,
  ) {
    const opsCtx: UserOpsCtx = {
      log: this.log,
      user: this.user,
      em: this.em,
    }

    await Promise.all(
      body.dxids.map(async (dxid) => {
        return await new dbClusterDomain.StartDbClusterOperation(opsCtx).execute({
          dxid,
        })
      }),
    )
  }

  @HttpCode(204)
  @Post('/stop')
  async stopDbCluster(
    @Body(new JsonSchemaPipe(utils.schemas.getDxidsInputSchema('dxids'))) body: IDxidListParams,
  ) {
    const opsCtx: UserOpsCtx = {
      log: this.log,
      user: this.user,
      em: this.em,
    }

    await Promise.all(
      body.dxids.map(async (dxid) => {
        return await new dbClusterDomain.StopDbClusterOperation(opsCtx).execute({
          dxid,
        })
      }),
    )
  }

  @HttpCode(204)
  @Post('/terminate')
  async terminateDbCluster(
    @Body(new JsonSchemaPipe(utils.schemas.getDxidsInputSchema('dxids'))) body: IDxidListParams,
  ) {
    const opsCtx: UserOpsCtx = {
      log: this.log,
      user: this.user,
      em: this.em,
    }

    await Promise.all(
      body.dxids.map(async (dxid) => {
        return await new dbClusterDomain.TerminateDbClusterOperation(opsCtx).execute({
          dxid,
        })
      }),
    )
  }

  @HttpCode(201)
  @Post('/create')
  async createDbCluster(
    @Body(new JsonSchemaPipe(dbClusterDomain.inputs.createDbClusterSchema))
    body: CreateDbClusterInput,
  ) {
    const opsCtx: UserOpsCtx = {
      log: this.log,
      user: this.user,
      em: this.em,
    }

    return await new dbClusterDomain.CreateDbClusterOperation(opsCtx).execute(body)
  }
}
