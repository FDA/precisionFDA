import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { EntityIdentifierQueryDTO } from '@shared/domain/entity/domain/entity-identifier-query.dto'
import { SiteAdminGuard } from '../admin/guards/site-admin.guard'
import { PublishApiFacade } from '../facade/publish/publish.facade'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

@UseGuards(UserContextGuard, SiteAdminGuard)
@Controller('/publish')
export class PublishController {
  constructor(private readonly publishApiFacade: PublishApiFacade) {}

  @Get('/tree-root')
  async getTreeRoot(@Query() query: EntityIdentifierQueryDTO) {
    return this.publishApiFacade.getPublishedTreeRoot(query.identifier, query.type)
  }
}
