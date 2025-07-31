import { Module } from '@nestjs/common'
import { SpaceModule } from '@shared/domain/space/space.module'
import { DbClusterModule } from '@shared/domain/db-cluster/db-cluster.module'
import { DbClusterGetFacade } from './db-cluster-get.facade'

@Module({
  imports: [DbClusterModule, SpaceModule],
  providers: [DbClusterGetFacade],
  exports: [DbClusterGetFacade],
})
export class DbClusterGetFacadeModule {}
