import { SqlEntityManager } from '@mikro-orm/mysql'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Logger,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'
import { DEPRECATED_SQL_ENTITY_MANAGER } from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import { AppInput, saveAppSchema } from '@shared/domain/app/app.input'
import { AppService } from '@shared/domain/app/services/app.service'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { RunAppInput, runAppSchema } from '@shared/domain/job/job.input'
import { CreateJobOperation } from '@shared/domain/job/ops/create'
import { LicensesForAppOperation } from '@shared/domain/license/ops/licenses-for-app'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { PlatformClient } from '@shared/platform-client'
import { UserOpsCtx } from '@shared/types'
import { schemas } from '@shared/utils/base-schemas'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { JsonSchemaPipe } from '../validation/pipes/json-schema.pipe'
import { AppUidParamDto } from './model/app-uid-param.dto'

@UseGuards(UserContextGuard)
@Controller('/apps')
export class AppController {
  constructor(
    private readonly user: UserContext,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER) private readonly em: SqlEntityManager,
    private readonly logger: Logger,
  ) {}

  @HttpCode(200)
  @Post()
  async createApp(@Body(new JsonSchemaPipe(saveAppSchema)) body: AppInput) {
    const platformClient = new PlatformClient({ accessToken: this.user.accessToken })
    const appService = new AppService(this.em, platformClient)

    return await appService.create(body, this.user.id)
  }

  @Get('/:appUid/licenses-to-accept')
  async getLicences(@Param() params: AppUidParamDto) {
    const opsCtx: UserOpsCtx = {
      log: this.logger,
      user: this.user,
      em: this.em,
    }

    return await new LicensesForAppOperation(opsCtx).execute({
      uid: params.appUid,
    })
  }

  @Post('/:appDxId/run')
  async run(
    @Param('appDxId', new JsonSchemaPipe(schemas.dxidProp)) appDxId: DxId<'app'>,
    @Body(new JsonSchemaPipe(runAppSchema)) body: Omit<RunAppInput, 'appDxid'>,
  ) {
    const opsCtx: UserOpsCtx = {
      log: this.logger,
      user: this.user,
      em: this.em,
    }

    const input: RunAppInput = {
      ...body,
      appDxId,
    }

    return await new CreateJobOperation(opsCtx).execute(input)
  }
}
