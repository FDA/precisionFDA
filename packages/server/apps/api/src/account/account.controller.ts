import { Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'
import { MaintenanceQueueJobProducer } from '@shared/queue/producer/maintenance-queue-job.producer'
import { InternalRouteGuard } from '../internal/guard/internal.guard'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

@UseGuards(InternalRouteGuard, UserContextGuard)
@Controller('/account')
export class AccountController {
  constructor(private readonly maintenanceQueueJobProducer: MaintenanceQueueJobProducer) {}

  @HttpCode(204)
  @Post('/checkSpacesPermissions')
  async checkSpacesPermissions(): Promise<void> {
    await this.maintenanceQueueJobProducer.createSyncSpacesPermissionsTask()
  }

  @ApiOperation({ summary: 'Trigger user checkup tasks' })
  @HttpCode(204)
  @Get('/checkup')
  async userCheckup(): Promise<void> {
    await this.maintenanceQueueJobProducer.createUserCheckupTask()
  }
}
