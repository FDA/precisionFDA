import { Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common'
import { MaintenanceQueueJobProducer } from '@shared/queue/producer/maintenance-queue-job.producer'
import { InternalRouteGuard } from '../internal/guard/internal.guard'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

@UseGuards(InternalRouteGuard, UserContextGuard)
@Controller('/account')
export class AccountController {
  constructor(private readonly maintenanceQueueJobProducer: MaintenanceQueueJobProducer) {}

  @HttpCode(204)
  @Post('/checkSpacesPermissions')
  async checkSpacesPermissions() {
    return await this.maintenanceQueueJobProducer.createSyncSpacesPermissionsTask()
  }

  @Get('/checkup')
  async userCheckup() {
    return await this.maintenanceQueueJobProducer.createUserCheckupTask()
  }
}
