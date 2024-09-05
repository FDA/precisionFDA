import { Module } from '@nestjs/common'
import { NodesController } from './nodes.controller'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'

@Module({
  imports: [UserFileModule],
  controllers: [NodesController],
})
export class NodesApiModule {}
