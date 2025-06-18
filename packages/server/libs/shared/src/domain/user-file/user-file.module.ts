import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { config } from '@shared/config'
import { NotificationModule } from '@shared/domain/notification/notification.module'
import { Resource } from '@shared/domain/resource/resource.entity'
import { ResourceModule } from '@shared/domain/resource/resource.module'
import { FileSyncQueueJobProducer } from '@shared/domain/user-file/producer/file-sync-queue-job.producer'
import { UserFileService } from '@shared/domain/user-file/service/user-file.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { BullQueueModule } from '@shared/queue/module/bull-queue-module'
import { Node } from './node.entity'
import { EntityModule } from '@shared/domain/entity/entity.module'
import { NodeHelper } from '@shared/domain/user-file/node.helper'
import { TaggingModule } from '@shared/domain/tagging/tagging.module'
import { SpaceEventModule } from '@shared/domain/space-event/space-event.module'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { FolderService } from '@shared/domain/user-file/folder.service'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { NodeService } from '@shared/domain/user-file/node.service'
import { SpaceModule } from '@shared/domain/space/space.module'
import { ArchiveEntryService } from '@shared/domain/user-file/service/archive-entry.service'
import { ArchiveEntry } from '@shared/domain/user-file/archive-entry.entity'
import { LicensedItem } from '@shared/domain/licensed-item/licensed-item.entity'

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
    MikroOrmModule.forFeature([
      Node,
      UserFile,
      Asset,
      Folder,
      User,
      Resource,
      ArchiveEntry,
      LicensedItem,
    ]),
  ],
  providers: [
    UserFileService,
    FolderService,
    NodeService,
    ArchiveEntryService,
    NodeHelper,
    FileSyncQueueJobProducer,
  ],
  exports: [
    UserFileService,
    FolderService,
    NodeService,
    ArchiveEntryService,
    BullQueueModule,
    FileSyncQueueJobProducer,
    MikroOrmModule,
  ],
})
export class UserFileModule {}
