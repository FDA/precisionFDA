import { Module } from '@nestjs/common'
import { EventModule } from '@shared/domain/event/event.module'
import { NotificationModule } from '@shared/domain/notification/notification.module'
import { SpaceEventModule } from '@shared/domain/space-event/space-event.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { CopyNodesFacade } from '@shared/facade/node-copy/copy-nodes.facade'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'

@Module({
  imports: [PlatformClientModule, UserFileModule, NotificationModule, EventModule, SpaceEventModule],
  providers: [CopyNodesFacade],
  exports: [CopyNodesFacade],
})
export class CopyNodesFacadeModule {}
