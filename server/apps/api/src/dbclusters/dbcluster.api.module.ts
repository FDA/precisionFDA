import { Module } from '@nestjs/common'
import { DbClusterController } from './dbcluster.controller'

@Module({
  controllers: [DbClusterController],
})
export class DbclusterApiModule {}
