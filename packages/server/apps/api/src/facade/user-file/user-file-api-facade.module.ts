import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { UserFileDownloadFacade } from './user-file-download.facade'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { SpaceModule } from '@shared/domain/space/space.module'
import { UserFileBulkDownloadFacade } from './user-file-bulk-download.facade'
import { UserFileGetFacade } from './user-file-get.facade'
import { EntityModule } from '@shared/domain/entity/entity.module'
import { EventModule } from '@shared/domain/event/event.module'
import { LicenseModule } from '@shared/domain/license/license.module'
import { JobServiceModule } from '@shared/domain/job/job-service.module'
import { ComparisonModule } from '@shared/domain/comparison/comparison.module'
import { NotificationModule } from '@shared/domain/notification/notification.module'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { AcceptedLicenseModule } from '@shared/domain/accepted-license/accepted-license.module'
import { UserFileResolverFacade } from './user-file-resolver.facade'

@Module({
  imports: [
    MikroOrmModule.forFeature([UserFile]),
    UserFileModule,
    SpaceModule,
    LicenseModule,
    JobServiceModule,
    ComparisonModule,
    EntityModule,
    EventModule,
    NotificationModule,
    PlatformClientModule,
    AcceptedLicenseModule,
  ],
  providers: [UserFileResolverFacade, UserFileDownloadFacade, UserFileBulkDownloadFacade, UserFileGetFacade],
  exports: [UserFileResolverFacade, UserFileDownloadFacade, UserFileBulkDownloadFacade, UserFileGetFacade],
})
export class UserFileApiFacadeModule {}
