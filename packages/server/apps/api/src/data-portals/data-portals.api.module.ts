import { Module } from '@nestjs/common'
import { DataPortalsController } from './data-portals.controller'
import { NotificationModule } from '@shared/domain/notification/notification.module'
import { DataPortalModule } from '@shared/domain/data-portal/data-portal.module'
import { CreateDataPortalFacadeModule } from '@shared/facade/data-portal-create/create-data-portal-facade.module'

@Module({
  imports: [NotificationModule, DataPortalModule, CreateDataPortalFacadeModule],
  controllers: [DataPortalsController],
})
export class DataPortalsApiModule {}
