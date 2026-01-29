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
import { SaveAppDto } from '@shared/domain/app/dto/save-app.dto'
import { AppService } from '@shared/domain/app/services/app.service'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { RunAppInput, runAppSchema } from '@shared/domain/job/job.input'
import { CreateJobOperation } from '@shared/domain/job/ops/create'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { UserOpsCtx } from '@shared/types'
import { schemas } from '@shared/utils/base-schemas'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { LicensesForAppFacade } from '../facade/license/licenses-for-app.facade'
import { JsonSchemaPipe } from '../validation/pipes/json-schema.pipe'
import { AppUidParamDto } from './model/app-uid-param.dto'
import { Uid } from '@shared/domain/entity/domain/uid'
import { License } from '@shared/domain/license/license.entity'
import { Job } from '@shared/domain/job/job.entity'

@UseGuards(UserContextGuard)
@Controller('/apps')
export class AppController {
  constructor(
    private readonly user: UserContext,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER) private readonly em: SqlEntityManager,
    private readonly logger: Logger,
    private readonly appService: AppService,
    private readonly licensesForAppFacade: LicensesForAppFacade,
  ) {}

  @HttpCode(200)
  @Post()
  async createApp(@Body() body: SaveAppDto): Promise<{ uid: Uid<'app'> }> {
    const appUid = await this.appService.create(body)
    return { uid: appUid }
  }

  @Get('/:appUid/licenses-to-accept')
  async getLicences(@Param() params: AppUidParamDto): Promise<License[]> {
    return await this.licensesForAppFacade.findLicensesForApp(params.appUid)
  }

  @Post('/:appDxId/run')
  async run(
    @Param('appDxId', new JsonSchemaPipe(schemas.dxidProp)) appDxId: DxId<'app'>,
    @Body(new JsonSchemaPipe(runAppSchema)) body: Omit<RunAppInput, 'appDxid'>,
  ): Promise<Job> {
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
