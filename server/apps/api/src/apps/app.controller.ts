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
import { DEPRECATED_SQL_ENTITY_MANAGER_TOKEN } from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import { App } from '@shared/domain/app/app.entity'
import { AppInput, saveAppSchema } from '@shared/domain/app/app.input'
import { AppService } from '@shared/domain/app/services/app.service'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { RunAppInput, runAppSchema } from '@shared/domain/job/job.input'
import { CreateJobOperation } from '@shared/domain/job/ops/create'
import { LicensesForAppOperation } from '@shared/domain/license/ops/licenses-for-app'
import { PlatformClient } from '@shared/platform-client'
import { AppDescribeResponse } from '@shared/platform-client/platform-client.responses'
import { AnyObject, UserOpsCtx } from '@shared/types'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { schemas } from '@shared/utils/base-schemas'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { JsonSchemaPipe } from '../validation/pipes/json-schema.pipe'

@UseGuards(UserContextGuard)
@Controller('/apps')
export class AppController {
  constructor(
    private readonly user: UserContext,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER_TOKEN) private readonly em: SqlEntityManager,
    private readonly log: Logger,
  ) {}

  @HttpCode(200)
  @Post()
  async createApp(@Body(new JsonSchemaPipe(saveAppSchema)) body: AppInput) {
    const platformClient = new PlatformClient(this.user.accessToken)
    const appService = new AppService(this.em, platformClient)

    return await appService.create(body, this.user.id)
  }

  @Get('/:appDxId/licenses-to-accept')
  async getLicences(
    @Param('appDxId', new JsonSchemaPipe(schemas.dxidProp)) appDxId: DxId<'app'>,
    @Body() body: AnyObject,
  ) {
    const opsCtx: UserOpsCtx = {
      log: this.log,
      user: this.user,
      em: this.em,
    }

    return await new LicensesForAppOperation(opsCtx).execute({
      ...body,
      uid: appDxId,
    })
  }

  @Post('/:appDxId/run')
  async run(
    @Param('appDxId', new JsonSchemaPipe(schemas.dxidProp)) appDxId: DxId<'app'>,
    @Body(new JsonSchemaPipe(runAppSchema)) body: Omit<RunAppInput, 'appDxid'>,
  ) {
    const opsCtx: UserOpsCtx = {
      log: this.log,
      user: this.user,
      em: this.em,
    }

    const input: RunAppInput = {
      ...body,
      appDxId,
    }

    return await new CreateJobOperation(opsCtx).execute(input)
  }

  // uses pFDA uid , not platfrom dxid
  @HttpCode(201)
  @Get('/:uid/describe')
  async describeApp(@Param('uid') uid: string) {
    const app = await this.em.findOneOrFail(App, { uid }, { populate: ['user'] })

    const platformClient = new PlatformClient(this.user.accessToken, this.log)
    const platformAppData = await platformClient.appDescribe({
      dxid: app.dxid,
      data: {},
    })

    return this.constructResponse(platformAppData, app)
  }

  private constructResponse(platformAppData: AppDescribeResponse, app: App) {
    const result = {
      ...platformAppData,
      dxid: platformAppData.id,
      id: app.uid,
      title: app.title,
      revision: app.revision,
      location: app.scope,
      'created-at': app.createdAt,
      'updated-at': app.updatedAt,
      'added-by': app.user.getProperty('dxuser'),
      'internet-access': app.spec.internet_access,
      'instance-type': app.spec.instance_type,
    }

    return result
  }
}
