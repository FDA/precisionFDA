import { Body, Controller, Delete, HttpCode, Post, UseGuards } from '@nestjs/common'
import { CliNodeDTO } from '@shared/domain/cli/dto/cli-node.dto'
import { CliNodeRemoveDTO } from '@shared/domain/cli/dto/cli-node-remove.dto'
import { CliNodeSearchDTO } from '@shared/domain/cli/dto/cli-node-search.dto'
import { CliFindNodesFacade } from '../facade/cli/cli-find-nodes.facade'
import { CliNodeRemoveFacade } from '../facade/cli/cli-node-remove.facade'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

// SPECIAL ROUTES INTENDED FOR CLI USAGE ONLY. CONTAINS CLI SPECIFIC LOGIC & SPECIAL RESPONSE OBJECTS.
@Controller('/cli/nodes')
export class CliNodesController {
  constructor(
    private readonly cliNodeRemoveFacade: CliNodeRemoveFacade,
    private readonly cliFindNodesFacade: CliFindNodesFacade,
  ) {}

  @UseGuards(UserContextGuard)
  @HttpCode(200)
  @Post()
  async findNodes(@Body() body: CliNodeSearchDTO): Promise<CliNodeDTO[]> {
    return await this.cliFindNodesFacade.findNodes(body)
  }

  @UseGuards(UserContextGuard)
  @HttpCode(200)
  @Delete()
  async removeNodes(@Body() body: CliNodeRemoveDTO): Promise<number> {
    return await this.cliNodeRemoveFacade.removeNodes(body)
  }
}
