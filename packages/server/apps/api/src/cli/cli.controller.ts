import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'
import { CliExchangeTokenInputDTO } from '@shared/domain/cli/dto/cli-exchange-token-input.dto'
import { CliExchangeTokenOutputDTO } from '@shared/domain/cli/dto/cli-exchange-token-output.dto'
import { CliRunAppDTO } from '@shared/domain/cli/dto/cli-run-app.dto'
import { Uid } from '@shared/domain/entity/domain/uid'
import { SetPropertiesDTO } from '@shared/domain/property/dto/set-properties.dto'
import { CliExchangeFacade } from '@shared/facade/cli-exchange/cli-exchange.facade'
import { SetPropertiesFacade } from '@shared/facade/property/set-properties.facade'
import { CliRunAppFacade } from '../facade/cli/cli-run-app.facade'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { UidValidationPipe } from '../validation/pipes/uid.pipe'

// SPECIAL ROUTES INTENDED FOR CLI USAGE ONLY. CONTAINS CLI SPECIFIC LOGIC & SPECIAL RESPONSE OBJECTS.
@Controller('/cli')
export class CliController {
  constructor(
    private readonly cliSetPropertiesFacade: SetPropertiesFacade,
    private readonly cliRunAppFacade: CliRunAppFacade,
    private readonly cliExchangeFacade: CliExchangeFacade,
  ) {}

  @Get('/version/latest')
  getLatestVersion(): { version: string } {
    return { version: '2.12.0' }
  }

  @ApiOperation({ summary: 'Exchange CLI token for platform workers' })
  @Post('/token/exchange')
  @HttpCode(200)
  async exchangeToken(@Body() body: CliExchangeTokenInputDTO): Promise<CliExchangeTokenOutputDTO> {
    return this.cliExchangeFacade.exchangeCLIToken(body.code)
  }

  @UseGuards(UserContextGuard)
  @HttpCode(201)
  @Post('/apps/:uid/run')
  async runApp(
    @Param('uid', new UidValidationPipe({ entityType: 'app' })) appUid: Uid<'app'>,
    @Body() body: CliRunAppDTO,
  ): Promise<{ jobUid: Uid<'job'> }> {
    const job = await this.cliRunAppFacade.runApp(appUid, body)
    return { jobUid: job.id }
  }

  @UseGuards(UserContextGuard)
  @Post('/properties')
  async setProperties(@Body() body: SetPropertiesDTO): Promise<void> {
    return this.cliSetPropertiesFacade.setProperties(body)
  }
}
