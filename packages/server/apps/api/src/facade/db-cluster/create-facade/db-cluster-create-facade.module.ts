import { Module } from '@nestjs/common'
import { DbClusterModule } from '@shared/domain/db-cluster/db-cluster.module'
import { SpaceModule } from '@shared/domain/space/space.module'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { DbClusterCreateFacade } from './db-cluster-create.facade'

@Module({
  imports: [DbClusterModule, PlatformClientModule, SpaceModule],
  providers: [DbClusterCreateFacade],
  exports: [DbClusterCreateFacade],
})
export class DbClusterCreateFacadeModule {}
