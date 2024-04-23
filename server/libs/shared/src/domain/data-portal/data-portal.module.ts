import { Module } from '@nestjs/common'
import { DataPortalService } from '@shared/domain/data-portal/service/data-portal.service'
import { EntityModule } from '@shared/domain/entity/entity.module'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { NotificationModule } from '@shared/domain/notification/notification.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { DataPortal } from '@shared/domain/data-portal/data-portal.entity'

@Module({
  imports: [
    PlatformClientModule,
    NotificationModule,
    UserFileModule,
    EntityModule,
    MikroOrmModule.forFeature([DataPortal]),
  ],
  providers: [DataPortalService],
  exports: [DataPortalService, MikroOrmModule],
})
export class DataPortalModule {}
