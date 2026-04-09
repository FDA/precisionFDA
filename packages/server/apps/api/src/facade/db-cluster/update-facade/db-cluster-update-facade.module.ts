import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { DbCluster } from '@shared/domain/db-cluster/db-cluster.entity'
import { DbClusterModule } from '@shared/domain/db-cluster/db-cluster.module'
import { DbClusterUpdateFacade } from './db-cluster-update.facade'

@Module({
  imports: [DbClusterModule, MikroOrmModule.forFeature([DbCluster])],
  providers: [DbClusterUpdateFacade],
  exports: [DbClusterUpdateFacade],
})
export class DbClusterUpdateFacadeModule {}
