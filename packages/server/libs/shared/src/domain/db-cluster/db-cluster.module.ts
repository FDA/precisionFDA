import { Module } from '@nestjs/common'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { DbCluster } from './db-cluster.entity'

@Module({
  imports: [MikroOrmModule.forFeature([DbCluster])],
  providers: [DbClusterService],
  exports: [DbClusterService, MikroOrmModule],
})
export class DbClusterModule {}
