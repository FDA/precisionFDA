import { Module } from '@nestjs/common'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { DbCluster } from './db-cluster.entity'
import { NotificationModule } from '../notification/notification.module'
import { DbClusterCountService } from './service/db-cluster-count.service'
import { DbClusterScopeFilterProvider } from './db-cluster-scope-filter.provider'

@Module({
  imports: [MikroOrmModule.forFeature([DbCluster]), NotificationModule],
  providers: [DbClusterService, DbClusterCountService, DbClusterScopeFilterProvider],
  exports: [DbClusterService, MikroOrmModule],
})
export class DbClusterModule {}
