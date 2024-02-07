import { Module } from '@nestjs/common'
import { DataPortalsController } from './data-portals.controller'
import { NotificationModule } from '@shared/domain/notification/notification.module'
import { DataPortalModule } from '@shared/domain/data-portal/data-portal.module'

@Module({
  imports: [NotificationModule, DataPortalModule],
  controllers: [DataPortalsController],
})
export class DataPortalsApiModule {}
