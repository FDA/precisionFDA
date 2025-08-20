import { Module } from '@nestjs/common'
import { SpaceModule } from '@shared/domain/space/space.module'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { DbClusterModule } from '@shared/domain/db-cluster/db-cluster.module'
import { DbClusterActionFacade } from './db-cluster-action.facade'

@Module({
  imports: [DbClusterModule, PlatformClientModule, SpaceModule],
  providers: [DbClusterActionFacade],
  exports: [DbClusterActionFacade],
})
export class DbClusterActionFacadeModule {}
