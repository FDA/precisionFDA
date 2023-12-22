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
import {
  app as appDomain,
  client,
  DEPRECATED_SQL_ENTITY_MANAGER_TOKEN,
  entities,
  job as jobDomain,
  license as licenseDomain,
  UserContext,
} from '@shared'
import { App } from '@shared/domain'
import { AppInput } from '@shared/domain/app/app.input'
import { DxId } from '@shared/domain/entity'
import { RunAppInput } from '@shared/domain/job/job.input'
import { AppDescribeResponse } from '@shared/platform-client/platform-client.responses'
import { AnyObject, UserOpsCtx } from '@shared/types'
import { schemas } from '@shared/utils'
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
  async createApp(@Body(new JsonSchemaPipe(appDomain.inputs.saveAppSchema)) body: AppInput) {
    const platformClient = new client.PlatformClient(this.user.accessToken)
    const appService = new appDomain.AppService(this.em, platformClient)

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

    return await new licenseDomain.LicensesForAppOperation(opsCtx).execute({
      ...body,
      uid: appDxId,
    })
  }

  @Post('/:appDxId/run')
  async run(
    @Param('appDxId', new JsonSchemaPipe(schemas.dxidProp)) appDxId: DxId<'app'>,
    @Body(new JsonSchemaPipe(jobDomain.inputs.runAppSchema)) body: Omit<RunAppInput, 'appDxid'>,
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

    return await new jobDomain.CreateJobOperation(opsCtx).execute(input)
  }

  // uses pFDA uid , not platfrom dxid
  @HttpCode(201)
  @Get('/:uid/describe')
  async describeApp(@Param('uid') uid: string) {
    const app = await this.em.findOneOrFail(entities.App, { uid }, { populate: ['user'] })

    const platformClient = new client.PlatformClient(this.user.accessToken, this.log)
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
