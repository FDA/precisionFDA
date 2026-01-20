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
import { CreateDataPortalDTO } from '@shared/domain/data-portal/dto/create-data-portal.dto'
import { CreateFileParamDTO } from '@shared/domain/data-portal/dto/CreateFileParamDTO'
import { DataPortalDTO } from '@shared/domain/data-portal/dto/data-portal.dto'
import { UpdateDataPortalDTO } from '@shared/domain/data-portal/dto/UpdateDataPortalDTO'
import { DataPortalService } from '@shared/domain/data-portal/service/data-portal.service'
import { CreateResourceResponse } from '@shared/domain/data-portal/service/data-portal.types'
import { CreateDataPortalFacade } from '@shared/facade/data-portal-create/create-data-portal.facade'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

@UseGuards(UserContextGuard)
@Controller('/data-portals')
export class DataPortalsController {
  constructor(
    private readonly dataPortalService: DataPortalService,
    private readonly createDataPortalFacade: CreateDataPortalFacade,
  ) {}

  /**
   * Creates new resource (just the metadata).
   */
  @HttpCode(201)
  @Post('/:identifier/resources')
  async createResource(
    @Param('identifier') identifier: string,
    @Body() body: CreateFileParamDTO,
  ): Promise<CreateResourceResponse> {
    return await this.dataPortalService.createResource(body, identifier)
  }

  /**
   * Removes resource from the database.
   */
  @Delete('/:portalId/resources/:resourceId')
  async removeResource(@Param('resourceId', ParseIntPipe) resourceId: number): Promise<void> {
    return await this.dataPortalService.removeResource(resourceId)
  }

  /**
   * Creates new data portal.
   */
  @HttpCode(201)
  @Post()
  async createDataPortal(@Body() body: CreateDataPortalDTO): Promise<DataPortalDTO> {
    return await this.createDataPortalFacade.create(body)
  }

  /**
   * Updates data portal.
   */
  @Patch('/:identifier')
  async updateDataPortal(@Body() body: UpdateDataPortalDTO): Promise<DataPortalDTO> {
    return await this.dataPortalService.update(body)
  }

  /**
   * List is not returning content of the portal.
   */
  @Get()
  async listDataPortals(): Promise<DataPortalDTO[]> {
    return await this.dataPortalService.list()
  }

  /**
   * Returns details of the portal (including content) by its url slug or id
   */
  @Get('/:identifier')
  async getDataPortal(@Param('identifier') identifier: string): Promise<DataPortalDTO> {
    return await this.dataPortalService.getByUrlSlugOrId(identifier)
  }

  /**
   * Returns list of resources that belong to given portal
   */
  @Get('/:identifier/resources')
  async listResources(
    @Param('identifier') identifier: string,
  ): Promise<{ id: number; name: string; url: string }[]> {
    return await this.dataPortalService.listResources(identifier)
  }
}
