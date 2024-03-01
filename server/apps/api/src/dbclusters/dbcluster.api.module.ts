import { Module } from '@nestjs/common'
import { DbClusterModule } from '@shared/domain/db-cluster/db-cluster.module'
import { DbClusterController } from './dbcluster.controller'

@Module({
  imports: [DbClusterModule],
  controllers: [DbClusterController],
})
export class DbClusterApiModule {}
