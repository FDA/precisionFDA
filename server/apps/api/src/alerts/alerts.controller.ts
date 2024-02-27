import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { AlertDTO } from '@shared/domain/alert/dto/AlertDTO'
import { CreateAlertDTO } from '@shared/domain/alert/dto/CreateAlertDTO'
import { AlertService } from '@shared/domain/alert/services/alert.service'
import { SiteAdminGuard } from '../admin/guards/site-admin.guard'

@UseGuards(SiteAdminGuard)
@Controller('/alerts')
export class AlertsController {

  constructor(private readonly alertService: AlertService) {}

  @Post()
  async create(@Body() alert: CreateAlertDTO) {
    const newAlert = await this.alertService.create(alert)
    return newAlert?.id
  }

  @Put('/:id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() alert: CreateAlertDTO): Promise<AlertDTO> {
    return await this.alertService.update(id, alert)
  }

  @Delete('/:id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.alertService.delete(id)
  }

  @Get()
  async getAll(@Query('active') active: string) {
    // This allows to filter active and inactive alerts but also to get all if omitted
    const isActive = active === 'true' ? true : active === 'false' ? false : undefined
    return await this.alertService.getAll(isActive)
  }

}
