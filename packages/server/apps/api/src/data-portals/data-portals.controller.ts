import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { DataPortalService } from '@shared/domain/data-portal/service/data-portal.service'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { CreateFileParamDTO } from '@shared/domain/data-portal/dto/CreateFileParamDTO'
import { CreateDataPortalDTO } from '@shared/domain/data-portal/dto/CreateDataPortalDTO'
import { UpdateDataPortalDTO } from '@shared/domain/data-portal/dto/UpdateDataPortalDTO'

@UseGuards(UserContextGuard)
@Controller('/data-portals')
export class DataPortalsController {
  constructor(private readonly dataPortalService: DataPortalService) {}

  /**
   * Creates new resource (just the metadata).
   */
  @HttpCode(201)
  @Post('/:identifier/resources')
  async createResource(@Param('identifier') identifier: string, @Body() body: CreateFileParamDTO) {
    return await this.dataPortalService.createResource(body, identifier)
  }

  /**
   * Removes resource from the database.
   */
  @Delete('/:portalId/resources/:resourceId')
  async removeResource(@Param('resourceId', ParseIntPipe) resourceId: number) {
    return await this.dataPortalService.removeResource(resourceId)
  }

  /**
   * Creates new card image (just the metadata).
   */
  @HttpCode(201)
  @Post('/:id/card-image')
  async createCardImage(@Param('id', ParseIntPipe) id: number, @Body() body: CreateFileParamDTO) {
    return await this.dataPortalService.createCardImage(body, id)
  }

  /**
   * Creates new data portal.
   */
  @HttpCode(201)
  @Post()
  async createDataPortal(@Body() body: CreateDataPortalDTO) {
    return await this.dataPortalService.create(body)
  }

  /**
   * Updates data portal.
   */
  @Patch('/:identifier')
  async updateDataPortal(@Body() body: UpdateDataPortalDTO) {
    return await this.dataPortalService.update(body)
  }

  /**
   * List is not returning content of the portal.
   */
  @Get()
  async listDataPortals() {
    return await this.dataPortalService.list()
  }

  /**
   * Returns details of the portal (including content) by its url slug or id
   */
  @Get('/:identifier')
  async getDataPortal(@Param('identifier') identifier: string) {
    return await this.dataPortalService.getByUrlSlugOrId(identifier)
  }

  /**
   * Returns list of resources that belong to given portal
   */
  @Get('/:identifier/resources')
  async listResources(@Param('identifier') identifier: string) {
    return await this.dataPortalService.listResources(identifier)
  }
}
