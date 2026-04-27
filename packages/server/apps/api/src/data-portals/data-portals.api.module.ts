import { Module } from '@nestjs/common'
import { DataPortalModule } from '@shared/domain/data-portal/data-portal.module'
import { NotificationModule } from '@shared/domain/notification/notification.module'
import { CreateDataPortalFacadeModule } from '@shared/facade/data-portal-create/create-data-portal-facade.module'
import { DataPortalResourceFacadeModule } from '@shared/facade/data-portal-resource/data-portal-resource-facade.module'
import { DataPortalsController } from './data-portals.controller'

@Module({
  imports: [NotificationModule, DataPortalModule, CreateDataPortalFacadeModule, DataPortalResourceFacadeModule],
  controllers: [DataPortalsController],
})
export class DataPortalsApiModule {}
