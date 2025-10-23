import { Module } from '@nestjs/common'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { NotificationModule } from '@shared/domain/notification/notification.module'
import { LockNodeFacade } from '@shared/facade/node-lock/lock-node.facade'

@Module({
  imports: [UserFileModule, NotificationModule],
  providers: [LockNodeFacade],
  exports: [LockNodeFacade],
})
export class NodeLockFacadeModule {}
