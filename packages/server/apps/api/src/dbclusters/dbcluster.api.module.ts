import { Module } from '@nestjs/common'
import { DbClusterModule } from '@shared/domain/db-cluster/db-cluster.module'
import { DbClusterController } from './dbcluster.controller'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'

@Module({
  imports: [DbClusterModule, PlatformClientModule],
  controllers: [DbClusterController],
})
export class DbClusterApiModule {}
