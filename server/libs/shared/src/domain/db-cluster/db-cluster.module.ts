import { Module } from '@nestjs/common'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'

@Module({
  imports: [PlatformClientModule],
  providers: [DbClusterService],
  exports: [DbClusterService],
})
export class DbClusterModule {}
