import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { FetchChildrenDTO } from '@shared/domain/user-file/dto/fetch-children.dto'
import { Node } from '@shared/domain/user-file/node.entity'
import { NodeService } from '@shared/domain/user-file/node.service'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

@UseGuards(UserContextGuard)
@Controller('/folders')
export class FoldersController {
  constructor(private readonly nodeService: NodeService) {}

  @Get('/children')
  async getChildren(@Query() input: FetchChildrenDTO): Promise<Node[]> {
    return this.nodeService.getFolderChildren(input)
  }
}
