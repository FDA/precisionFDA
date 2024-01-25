import { Module } from '@nestjs/common'
import { NodesController } from './nodes.controller'

@Module({
  controllers: [NodesController],
})
export class NodesApiModule {}
