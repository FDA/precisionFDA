import { Module } from '@nestjs/common'
import { NodesController } from './nodes.controller'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { RemoveNodesFacadeModule } from '@shared/facade/node-remove/remove-nodes-facade.module'

@Module({
  imports: [UserFileModule, RemoveNodesFacadeModule],
  controllers: [NodesController],
})
export class NodesApiModule {}
