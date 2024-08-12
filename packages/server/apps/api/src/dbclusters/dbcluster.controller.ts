import { SqlEntityManager } from '@mikro-orm/mysql'
import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Logger,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common'
import { DEPRECATED_SQL_ENTITY_MANAGER } from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import { CreateDbClusterDTO } from '@shared/domain/db-cluster/dto/CreateDbClusterDTO'
import { UpdateDbClusterDTO } from '@shared/domain/db-cluster/dto/UpdateDbClusterDTO'
import { StartDbClusterOperation } from '@shared/domain/db-cluster/ops/start'
import { StopDbClusterOperation } from '@shared/domain/db-cluster/ops/stop'
import { TerminateDbClusterOperation } from '@shared/domain/db-cluster/ops/terminate'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { UserOpsCtx } from '@shared/types'
import { schemas } from '@shared/utils/base-schemas'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { JsonSchemaPipe } from '../validation/pipes/json-schema.pipe'
import { DbClusterUidParamDto } from './model/dbcluster-uid-param.dto'

interface IDxidListParams {
  dxids: string[]
}

@UseGuards(UserContextGuard)
@Controller('/dbclusters')
export class DbClusterController {
  constructor(
    private readonly user: UserContext,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER) private readonly em: SqlEntityManager,
    private readonly logger: Logger,
    private readonly dbClusterService: DbClusterService,
  ) {}

  @HttpCode(204)
  @Post('/start')
  async startDbCluster(
    @Body(new JsonSchemaPipe(schemas.getDxidsInputSchema('dxids'))) body: IDxidListParams,
  ) {
    const opsCtx: UserOpsCtx = {
      log: this.logger,
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
      log: this.logger,
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
      log: this.logger,
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
  @Post()
  async createDbCluster(@Body() body: CreateDbClusterDTO) {
    return await this.dbClusterService.create(body)
  }

  @HttpCode(200)
  @Put(':dbclusterUid')
  async updateDbCluster(@Param() params: DbClusterUidParamDto, @Body() body: UpdateDbClusterDTO) {
    return await this.dbClusterService.update(params.dbclusterUid, body)
  }
}
