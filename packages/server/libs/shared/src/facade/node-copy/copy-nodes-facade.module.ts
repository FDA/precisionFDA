import { Module } from '@nestjs/common'
import { CopyNodesFacade } from '@shared/facade/node-copy/copy-nodes.facade'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { NotificationModule } from '@shared/domain/notification/notification.module'
import { EventModule } from '@shared/domain/event/event.module'
import { SpaceEventModule } from '@shared/domain/space-event/space-event.module'

@Module({
  imports: [
    PlatformClientModule,
    UserFileModule,
    NotificationModule,
    EventModule,
    SpaceEventModule,
  ],
  providers: [CopyNodesFacade],
  exports: [CopyNodesFacade],
})
export class CopyNodesFacadeModule {}
