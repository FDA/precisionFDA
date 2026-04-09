import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { Node } from '@shared/domain/user-file/node.entity'
import { NodeService } from '@shared/domain/user-file/node.service'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { FetchChildrenDTO } from './model/fetch-children.dto'

@UseGuards(UserContextGuard)
@Controller('/folders')
export class FolderController {
  constructor(private readonly nodeService: NodeService) {}

  @Get('/children')
  async getChildren(@Query() input: FetchChildrenDTO): Promise<Node[]> {
    return this.nodeService.getFolderChildren(input)
  }
}
