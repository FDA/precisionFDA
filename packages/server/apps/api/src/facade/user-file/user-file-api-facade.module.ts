import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { EntityModule } from '@shared/domain/entity/entity.module'
import { EventModule } from '@shared/domain/event/event.module'
import { NotificationModule } from '@shared/domain/notification/notification.module'
import { SpaceModule } from '@shared/domain/space/space.module'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { UserFileBulkDownloadFacade } from './user-file-bulk-download.facade'
import { UserFileDownloadFacade } from './user-file-download.facade'
import { UserFileResolverFacade } from './user-file-resolver.facade'

@Module({
  imports: [
    MikroOrmModule.forFeature([UserFile]),
    UserFileModule,
    SpaceModule,
    EntityModule,
    NotificationModule,
    PlatformClientModule,
    EventModule,
  ],
  providers: [UserFileResolverFacade, UserFileDownloadFacade, UserFileBulkDownloadFacade],
  exports: [UserFileResolverFacade, UserFileDownloadFacade, UserFileBulkDownloadFacade],
})
export class UserFileApiFacadeModule {}
