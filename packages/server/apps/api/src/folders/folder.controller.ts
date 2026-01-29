import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { Node } from '@shared/domain/user-file/node.entity'
import { FetchChildrenDTO } from './model/fetch-children.dto'
import { NodeService } from '@shared/domain/user-file/node.service'

@UseGuards(UserContextGuard)
@Controller('/folders')
export class FolderController {
  constructor(private readonly nodeService: NodeService) {}

  @Get('/children')
  async getChildren(@Query() input: FetchChildrenDTO): Promise<Node[]> {
    return this.nodeService.getFolderChildren(input)
  }
}
