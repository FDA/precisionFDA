import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { DataPortalService } from '@shared/domain/data-portal/service/data-portal.service'
import { DataPortalParam, FileParam } from '@shared/domain/data-portal/service/data-portal.types'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { JsonSchemaPipe } from '../validation/pipes/json-schema.pipe'
import { dataPortalCreate, dataPortalUpdate, file } from './data-portals.schemas'

@UseGuards(UserContextGuard)
@Controller('/data-portals')
export class DataPortalsController {
  constructor(private readonly dataPortalService: DataPortalService) {}

  /**
   * Creates new resource (just the metadata).
   */
  @HttpCode(201)
  @Post('/:id/resources')
  async createResource(
    @Param('id', ParseIntPipe) id: number,
    @Body(new JsonSchemaPipe(file)) body: FileParam,
  ) {
    return await this.dataPortalService.createResource(body, id)
  }

  /**
   * Removes resource from the database.
   */
  @Delete('/:portalId/resources/:resourceId')
  async removeResource(@Param('resourceId', ParseIntPipe) resourceId: number) {
    return await this.dataPortalService.removeResource(resourceId)
  }

  /**
   * Creates resource link.
   */
  @HttpCode(201)
  @Post('/:portalId/resources/:resourceId')
  async createResourceLink(@Param('resourceId', ParseIntPipe) resourceId: number) {
    return await this.dataPortalService.createResourceLink(resourceId)
  }

  /**
   * Creates new card image (just the metadata).
   */
  @HttpCode(201)
  @Post('/:id/card-image')
  async createCardImage(
    @Param('id', ParseIntPipe) id: number,
    @Body(new JsonSchemaPipe(file)) body: FileParam,
  ) {
    return await this.dataPortalService.createCardImage(body, id)
  }

  /**
   * Creates new data portal.
   */
  @HttpCode(201)
  @Post()
  async createDataPortal(@Body(new JsonSchemaPipe(dataPortalCreate)) body: DataPortalParam) {
    return await this.dataPortalService.create(body)
  }

  /**
   * Updates data portal.
   */
  @Patch('/:id')
  async updateDataPortal(@Body(new JsonSchemaPipe(dataPortalUpdate)) body: DataPortalParam) {
    return await this.dataPortalService.update(body)
  }

  /**
   * List is not returning content of the portal.
   */
  @Get()
  async listDataPortals(
    @Query('default', new DefaultValuePipe(false), ParseBoolPipe) defaultParam: boolean,
  ) {
    return await this.dataPortalService.list(defaultParam)
  }

  /**
   * Get the default Data Portal
   */
  // TODO add tests for displaying default data portal to user
  @Get('/default')
  async getDefaultDataPortal() {
    return await this.dataPortalService.getDefault()
  }

  /**
   * Get list of custom Data Portals
   */
  @Get('/custom')
  async listAccessibleDataPortals() {
    return await this.dataPortalService.listAccessibleCustomPortals()
  }

  /**
   * Returns details of the portal (including content).
   */
  @Get('/:id')
  async getDataPortal(@Param('id', ParseIntPipe) id: number) {
    return await this.dataPortalService.get(id)
  }

  /**
   * Returns list of resources that belong to given portal
   */
  @Get('/:id/resources')
  async listResources(@Param('id', ParseIntPipe) id: number) {
    return await this.dataPortalService.listResources(id)
  }
}
