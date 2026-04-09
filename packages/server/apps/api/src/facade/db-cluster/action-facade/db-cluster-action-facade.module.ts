import { Module } from '@nestjs/common'
import { DbClusterModule } from '@shared/domain/db-cluster/db-cluster.module'
import { SpaceModule } from '@shared/domain/space/space.module'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { DbClusterActionFacade } from './db-cluster-action.facade'

@Module({
  imports: [DbClusterModule, PlatformClientModule, SpaceModule],
  providers: [DbClusterActionFacade],
  exports: [DbClusterActionFacade],
})
export class DbClusterActionFacadeModule {}
