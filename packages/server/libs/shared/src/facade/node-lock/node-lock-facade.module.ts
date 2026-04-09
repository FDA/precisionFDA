import { Module } from '@nestjs/common'
import { NotificationModule } from '@shared/domain/notification/notification.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { LockNodeFacade } from '@shared/facade/node-lock/lock-node.facade'

@Module({
  imports: [UserFileModule, NotificationModule],
  providers: [LockNodeFacade],
  exports: [LockNodeFacade],
})
export class NodeLockFacadeModule {}
