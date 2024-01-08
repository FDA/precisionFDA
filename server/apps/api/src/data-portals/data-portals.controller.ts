import { SqlEntityManager } from '@mikro-orm/mysql'
import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  Inject,
  Logger,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { DEPRECATED_SQL_ENTITY_MANAGER_TOKEN } from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import { DataPortalService } from '@shared/domain/data-portal/service/data-portal.service'
import { DataPortalParam, FileParam } from '@shared/domain/data-portal/service/data-portal.types'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { FileRemoveOperation } from '@shared/domain/user-file/ops/file-remove'
import { PlatformClient } from '@shared/platform-client'
import { UserOpsCtx } from '@shared/types'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { JsonSchemaPipe } from '../validation/pipes/json-schema.pipe'
import { dataPortalCreate, dataPortalUpdate, file } from './data-portals.schemas'

@UseGuards(UserContextGuard)
@Controller('/data-portals')
export class DataPortalsController {
  constructor(
    private readonly user: UserContext,
    private readonly log: Logger,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER_TOKEN) private readonly em: SqlEntityManager,
  ) {}

  /**
   * Creates new resource (just the metadata).
   */
  @HttpCode(201)
  @Post('/:id/resources')
  async createResource(
    @Param('id', ParseIntPipe) id: number,
    @Body(new JsonSchemaPipe(file)) body: FileParam,
  ) {
    const userClient = new PlatformClient(this.user?.accessToken, this.log)
    const dataPortalService = new DataPortalService(this.em, userClient)

    return await dataPortalService.createResource(body, id, this.user.id)
  }

  /**
   * Removes resource from the database.
   */
  @Delete('/:portalId/resources/:resourceId')
  async removeResource(@Param('resourceId', ParseIntPipe) resourceId: number) {
    const opsCtx: UserOpsCtx = {
      log: this.log,
      user: this.user,
      em: this.em,
    }

    const userClient = new PlatformClient(this.user?.accessToken, this.log)
    const fileRemoveOperation = new FileRemoveOperation(opsCtx)
    const dataPortalService = new DataPortalService(this.em, userClient, fileRemoveOperation)

    return await dataPortalService.removeResource(resourceId, this.user.id)
  }

  /**
   * Creates resource link.
   */
  @HttpCode(201)
  @Post('/:portalId/resources/:resourceId')
  async createResourceLink(@Param('resourceId', ParseIntPipe) resourceId: number) {
    const userClient = new PlatformClient(this.user?.accessToken, this.log)
    const dataPortalService = new DataPortalService(this.em, userClient)

    return await dataPortalService.createResourceLink(resourceId)
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
    const userClient = new PlatformClient(this.user?.accessToken, this.log)
    const dataPortalService = new DataPortalService(this.em, userClient)

    return await dataPortalService.createCardImage(body, id, this.user.id)
  }

  /**
   * Creates new data portal.
   */
  @HttpCode(201)
  @Post()
  async createDataPortal(@Body(new JsonSchemaPipe(dataPortalCreate)) body: DataPortalParam) {
    const userClient = new PlatformClient(this.user?.accessToken, this.log)
    const dataPortalService = new DataPortalService(this.em, userClient)

    return await dataPortalService.create(body, this.user.id)
  }

  /**
   * Updates data portal.
   */
  @Patch('/:id')
  async updateDataPortal(@Body(new JsonSchemaPipe(dataPortalUpdate)) body: DataPortalParam) {
    const userClient = new PlatformClient(this.user?.accessToken, this.log)
    const dataPortalService = new DataPortalService(this.em, userClient)

    return await dataPortalService.update(body, this.user!.id)
  }

  /**
   * List is not returning content of the portal.
   */
  @Get()
  async listDataPortals(
    @Query('default', new DefaultValuePipe(false), ParseBoolPipe) defaultParam: boolean,
  ) {
    const userClient = new PlatformClient(this.user?.accessToken, this.log)
    const dataPortalService = new DataPortalService(this.em, userClient)

    return await dataPortalService.list(this.user!.id, defaultParam)
  }

  /**
   * Get the default Data Portal
   */
  // TODO add tests for displaying default data portal to user
  @Get('/default')
  async getDefaultDataPortal() {
    const userClient = new PlatformClient(this.user?.accessToken, this.log)
    const dataPortalService = new DataPortalService(this.em, userClient)

    return await dataPortalService.getDefault(this.user.id)
  }

  /**
   * Get list of custom Data Portals
   */
  @Get('/custom')
  async listAccessibleDataPortals() {
    const userClient = new PlatformClient(this.user.accessToken, this.log)
    const dataPortalService = new DataPortalService(this.em, userClient)

    return await dataPortalService.listAccessibleCustomPortals(this.user.id)
  }

  /**
   * Returns details of the portal (including content).
   */
  @Get('/:id')
  async getDataPortal(@Param('id', ParseIntPipe) id: number) {
    const userClient = new PlatformClient(this.user?.accessToken, this.log)
    const dataPortalService = new DataPortalService(this.em, userClient)

    return await dataPortalService.get(id, this.user.id)
  }

  /**
   * Returns list of resources that belong to given portal
   */
  @Get('/:id/resources')
  async listResources(@Param('id', ParseIntPipe) id: number) {
    const userClient = new PlatformClient(this.user?.accessToken, this.log)
    const dataPortalService = new DataPortalService(this.em, userClient)

    return await dataPortalService.listResources(id, this.user.id)
  }
}
