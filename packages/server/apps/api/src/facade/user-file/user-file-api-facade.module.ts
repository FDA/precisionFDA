import { Module } from '@nestjs/common'
import { UserFileResolverFacade } from './user-file-resolver.facade'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { UserFileDownloadFacade } from './user-file-download.facade'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { SpaceModule } from '@shared/domain/space/space.module'
import { UserFileBulkDownloadFacade } from './user-file-bulk-download.facade'
import { EntityModule } from '@shared/domain/entity/entity.module'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { NotificationModule } from '@shared/domain/notification/notification.module'
import { EventModule } from '@shared/domain/event/event.module'

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
