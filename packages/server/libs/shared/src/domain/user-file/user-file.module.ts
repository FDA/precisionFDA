import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { config } from '@shared/config'
import { EntityModule } from '@shared/domain/entity/entity.module'
import { EventModule } from '@shared/domain/event/event.module'
import { LicensedItem } from '@shared/domain/licensed-item/licensed-item.entity'
import { NotificationModule } from '@shared/domain/notification/notification.module'
import { Resource } from '@shared/domain/resource/resource.entity'
import { ResourceModule } from '@shared/domain/resource/resource.module'
import { SpaceModule } from '@shared/domain/space/space.module'
import { SpaceEventModule } from '@shared/domain/space-event/space-event.module'
import { TaggingModule } from '@shared/domain/tagging/tagging.module'
import { User } from '@shared/domain/user/user.entity'
import { ArchiveEntry } from '@shared/domain/user-file/archive-entry.entity'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { FolderService } from '@shared/domain/user-file/folder.service'
import { NodeHelper } from '@shared/domain/user-file/node.helper'
import { NodeService } from '@shared/domain/user-file/node.service'
import { FileSyncQueueJobProducer } from '@shared/domain/user-file/producer/file-sync-queue-job.producer'
import { ArchiveEntryService } from '@shared/domain/user-file/service/archive-entry.service'
import { AssetCountService } from '@shared/domain/user-file/service/asset-count.service'
import { AssetScopeFilterProvider } from '@shared/domain/user-file/service/asset-scope-filter.provider'
import { FileCountService } from '@shared/domain/user-file/service/file-count.service'
import { FileScopeFilterProvider } from '@shared/domain/user-file/service/file-scope-filter.provider'
import { UrlFetchService } from '@shared/domain/user-file/service/url-fetch.service'
import { UserFileService } from '@shared/domain/user-file/service/user-file.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { BullQueueModule } from '@shared/queue/module/bull-queue-module'
import { Node } from './node.entity'

@Module({
  imports: [
    BullQueueModule.registerQueue({
      name: config.workerJobs.queues.fileSync.name,
      defaultJobOptions: {
        // if set to false, it will eventually eat up space in the redis instance
        removeOnComplete: true,
        removeOnFail: true,
        priority: 7,
      },
    }),
    PlatformClientModule,
    NotificationModule,
    EntityModule,
    ResourceModule,
    TaggingModule,
    SpaceEventModule,
    SpaceModule,
    EventModule,
    MikroOrmModule.forFeature([Node, UserFile, Asset, Folder, User, Resource, ArchiveEntry, LicensedItem]),
  ],
  providers: [
    UserFileService,
    FolderService,
    NodeService,
    ArchiveEntryService,
    UrlFetchService,
    NodeHelper,
    FileSyncQueueJobProducer,
    FileCountService,
    AssetCountService,
    FileScopeFilterProvider,
    AssetScopeFilterProvider,
  ],
  exports: [
    UserFileService,
    NodeService,
    NodeHelper,
    ArchiveEntryService,
    UrlFetchService,
    BullQueueModule,
    FileSyncQueueJobProducer,
    MikroOrmModule,
  ],
})
export class UserFileModule {}
