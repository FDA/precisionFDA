import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { CliAssetListDTO } from '@shared/domain/cli/dto/cli-assets-list.dto'
import { CliScopeQueryDTO } from '@shared/domain/cli/dto/cli-scope-query.dto'
import { CliAssetsListFacade } from '../facade/cli/cli-assets-list.facade'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

@Controller('/cli/assets')
export class CliAssetsController {
  constructor(private readonly cliAssetsListFacade: CliAssetsListFacade) {}

  @UseGuards(UserContextGuard)
  @Get()
  async listAssets(@Query() query: CliScopeQueryDTO): Promise<CliAssetListDTO[]> {
    return this.cliAssetsListFacade.listAssets(query.scope)
  }
}
