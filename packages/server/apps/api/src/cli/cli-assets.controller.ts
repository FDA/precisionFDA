import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { CliListAssetDTO } from '@shared/domain/cli/dto/cli-list-assets.dto'
import { CliScopeQueryDTO } from '@shared/domain/cli/dto/cli-scope-query.dto'
import { CliListAssetsFacade } from '../facade/cli/cli-list-assets.facade'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

@Controller('/cli/assets')
export class CliAssetsController {
  constructor(private readonly cliListAssetsFacade: CliListAssetsFacade) {}

  @UseGuards(UserContextGuard)
  @Get()
  async listAssets(@Query() query: CliScopeQueryDTO): Promise<CliListAssetDTO[]> {
    return this.cliListAssetsFacade.listAssets(query.scope)
  }
}
