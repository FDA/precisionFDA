import { Module } from '@nestjs/common'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { CopyNodesFacadeModule } from '@shared/facade/node-copy/copy-nodes-facade.module'
import { NodeLockFacadeModule } from '@shared/facade/node-lock/node-lock-facade.module'
import { RemoveNodesFacadeModule } from '@shared/facade/node-remove/remove-nodes-facade.module'
import { NodeUnlockFacadeModule } from '@shared/facade/node-unlock/node-unlock-facade.module'
import { NodesController } from './nodes.controller'

@Module({
  imports: [
    UserFileModule,
    CopyNodesFacadeModule,
    RemoveNodesFacadeModule,
    NodeUnlockFacadeModule,
    NodeLockFacadeModule,
  ],
  controllers: [NodesController],
})
export class NodesApiModule {}
