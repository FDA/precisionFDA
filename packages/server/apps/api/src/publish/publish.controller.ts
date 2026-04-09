import { Body, Controller, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common'
import { EntityIdentifierQueryDTO } from '@shared/domain/entity/domain/entity-identifier-query.dto'
import { SiteAdminGuard } from '../admin/guards/site-admin.guard'
import { PublishApiFacade } from '../facade/publish/publish.facade'
import { PublisherFacade } from '../facade/publish/publisher.facade'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

@UseGuards(UserContextGuard, SiteAdminGuard)
@Controller('/publish')
export class PublishController {
  constructor(
    private readonly publishApiFacade: PublishApiFacade,
    private readonly publisherFacade: PublisherFacade,
  ) {}

  @Get('/tree-root')
  async getTreeRoot(@Query() query: EntityIdentifierQueryDTO) {
    return this.publishApiFacade.getPublishedTreeRoot(query.identifier, query.type)
  }

  /**
   * @description Publish a given entity in public scope.
   * At the moment, this is only used for private folders publishing.
   * It will publish the folder and all its children in public scope.
   */
  @HttpCode(200)
  @Post()
  async publishEntity(@Body() body: EntityIdentifierQueryDTO): Promise<number> {
    return await this.publisherFacade.publishFolder(body.identifier)
  }
}
