import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common'
import { RunAppDTO } from '@shared/domain/app/dto/run-app.dto'
import { SaveAppDTO } from '@shared/domain/app/dto/save-app.dto'
import { Uid } from '@shared/domain/entity/domain/uid'
import { License } from '@shared/domain/license/license.entity'
import { AppCreateFacade } from '@shared/facade/app/app-create.facade'
import { AppRunFacade } from '@shared/facade/app/app-run.facade'
import { LicensesForAppFacade } from '../facade/license/licenses-for-app.facade'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { AppUidParamDto } from './model/app-uid-param.dto'

@UseGuards(UserContextGuard)
@Controller('/apps')
export class AppController {
  constructor(
    private readonly licensesForAppFacade: LicensesForAppFacade,
    private readonly appRunFacade: AppRunFacade,
    private readonly appCreateFacade: AppCreateFacade,
  ) {}

  @HttpCode(200)
  @Post()
  async createApp(@Body() body: SaveAppDTO): Promise<{ uid: Uid<'app'> }> {
    const appUid = await this.appCreateFacade.create(body)
    return { uid: appUid }
  }

  @Get('/:appUid/licenses-to-accept')
  async getLicences(@Param() params: AppUidParamDto): Promise<License[]> {
    return await this.licensesForAppFacade.findLicensesForApp(params.appUid)
  }

  @HttpCode(201)
  @Post('/:appUid/run')
  async run(@Param() params: AppUidParamDto, @Body() body: RunAppDTO): Promise<{ id: Uid<'job'> }> {
    return await this.appRunFacade.run(params.appUid, body)
  }
}
