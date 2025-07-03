import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { CreateSpaceGroupDTO } from '@shared/domain/space/dto/create-space-group.dto'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { SpacePaginationDTO } from '@shared/domain/space/dto/space-pagination-d-t.o'
import { SpaceGroupDTO } from '@shared/domain/space/dto/space-group.dto'
import { PaginatedResult } from '@shared/domain/entity/domain/paginated.result'
import { SpaceListItemDTO } from '@shared/domain/space/dto/space-list-item.dto'
import { SpaceOrSiteAdminGuard } from '../admin/guards/space-or-site-admin.guard'

@UseGuards(UserContextGuard)
@Controller('/space-groups')
export class SpaceGroupsController {
  @ServiceLogger()
  protected readonly logger: Logger

  constructor(private readonly spaceService: SpaceService) {}

  @Get('/:id')
  async getSpaceGroup(@Param('id', ParseIntPipe) id: number): Promise<SpaceGroupDTO> {
    return await this.spaceService.getSpaceGroupById(id)
  }

  @Get()
  async list(): Promise<SpaceGroupDTO[]> {
    return await this.spaceService.listSpaceGroups()
  }

  @UseGuards(SpaceOrSiteAdminGuard)
  @HttpCode(201)
  @Post()
  async create(@Body() space: CreateSpaceGroupDTO): Promise<{ id: number }> {
    const spaceGroupId = await this.spaceService.createSpaceGroup(space)
    return { id: spaceGroupId }
  }

  @UseGuards(SpaceOrSiteAdminGuard)
  @Put('/:id')
  async update(
    @Param('id', ParseIntPipe) spaceGroupId: number,
    @Body() spaceGroup: CreateSpaceGroupDTO,
  ): Promise<void> {
    return await this.spaceService.updateSpaceGroup(spaceGroupId, spaceGroup)
  }

  @UseGuards(SpaceOrSiteAdminGuard)
  @Delete('/:id')
  async delete(@Param('id', ParseIntPipe) spaceGroupId: number): Promise<void> {
    return await this.spaceService.deleteSpaceGroup(spaceGroupId)
  }

  @Get('/:id/spaces')
  async getSpaceGroupSpaces(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: SpacePaginationDTO,
  ): Promise<PaginatedResult<SpaceListItemDTO>> {
    return await this.spaceService.paginateSpaceGroupSpaces(id, query)
  }

  @UseGuards(SpaceOrSiteAdminGuard)
  @Post('/:spaceGroupId/spaces')
  async addSpaces(
    @Param('spaceGroupId', ParseIntPipe) spaceGroupId: number,
    @Body('spaceIds') spaceIds: number[],
  ): Promise<void> {
    await this.spaceService.addSpacesIntoSpaceGroup(spaceGroupId, spaceIds)
  }

  @UseGuards(SpaceOrSiteAdminGuard)
  @Delete('/:spaceGroupId/spaces')
  async removeSpaces(
    @Param('spaceGroupId', ParseIntPipe) spaceGroupId: number,
    @Query('spaceIds', new ParseArrayPipe({ items: Number, separator: ',' })) spaceIds: number[],
  ): Promise<void> {
    await this.spaceService.removeSpacesFromSpaceGroup(spaceGroupId, spaceIds)
  }
}
