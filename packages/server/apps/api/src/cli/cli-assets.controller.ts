import { Body, Controller, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common'
import { CliAssetListDTO } from '@shared/domain/cli/dto/cli-assets-list.dto'
import { CliScopeQueryDTO } from '@shared/domain/cli/dto/cli-scope-query.dto'
import { EntityUidResponseDTO } from '@shared/domain/entity/dto/entity-uid-response.dto'
import { AssetCreateDTO } from '@shared/domain/user-file/dto/asset-create.dto'
import { UserFileCreateFacade } from '@shared/facade/file-create/user-file-create.facade'
import { CliAssetsListFacade } from '../facade/cli/cli-assets-list.facade'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

@UseGuards(UserContextGuard)
@Controller('/cli/assets')
export class CliAssetsController {
  constructor(
    private readonly cliAssetsListFacade: CliAssetsListFacade,
    private readonly userFileCreateFacade: UserFileCreateFacade,
  ) {}

  @Get()
  async listAssets(@Query() query: CliScopeQueryDTO): Promise<CliAssetListDTO[]> {
    return this.cliAssetsListFacade.listAssets(query.scope)
  }

  @HttpCode(200)
  @Post()
  async createAsset(@Body() body: AssetCreateDTO): Promise<EntityUidResponseDTO> {
    return this.userFileCreateFacade.createAsset(body)
  }
}
