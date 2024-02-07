import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { config } from '@shared/config'
import { NotificationModule } from '@shared/domain/notification/notification.module'
import {
  fileRemoveOperationProvider,
  nodesRemoveOperationProvider,
} from '@shared/domain/user-file/providers/user-file.provider'
import { UserFileService } from '@shared/domain/user-file/service/user-file.service'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { ResourceModule } from '@shared/domain/resource/resource.module'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Node } from './node.entity'
import {UserFile} from "@shared/domain/user-file/user-file.entity";
import {User} from "@shared/domain/user/user.entity";
import {Resource} from "@shared/domain/resource/resource.entity";

@Module({
  imports: [
    BullModule.registerQueue({
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
    ResourceModule,
    MikroOrmModule.forFeature([Node]),
    MikroOrmModule.forFeature([UserFile]),
    MikroOrmModule.forFeature([User]),
    MikroOrmModule.forFeature([Resource]),
  ],
  providers: [UserFileService, nodesRemoveOperationProvider, fileRemoveOperationProvider],
  exports: [UserFileService, BullModule, nodesRemoveOperationProvider, fileRemoveOperationProvider],
})
export class UserFileModule {}
