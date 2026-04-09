import { Module } from '@nestjs/common'
import { NotificationModule } from '@shared/domain/notification/notification.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { UnlockNodeFacade } from '@shared/facade/node-unlock/unlock-node.facade'

@Module({
  imports: [UserFileModule, NotificationModule],
  providers: [UnlockNodeFacade],
  exports: [UnlockNodeFacade],
})
export class NodeUnlockFacadeModule {}
