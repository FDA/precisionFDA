import { Module } from '@nestjs/common'
import { UnlockNodeFacade } from '@shared/facade/node-unlock/unlock-node.facade'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { NotificationModule } from '@shared/domain/notification/notification.module'

@Module({
  imports: [UserFileModule, NotificationModule],
  providers: [UnlockNodeFacade],
  exports: [UnlockNodeFacade],
})
export class NodeUnlockFacadeModule {}
