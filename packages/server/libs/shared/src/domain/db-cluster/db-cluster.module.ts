import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'
import { NotificationModule } from '../notification/notification.module'
import { DbCluster } from './db-cluster.entity'
import { DbClusterScopeFilterProvider } from './db-cluster-scope-filter.provider'
import { DbClusterCountService } from './service/db-cluster-count.service'

@Module({
  imports: [MikroOrmModule.forFeature([DbCluster]), NotificationModule],
  providers: [DbClusterService, DbClusterCountService, DbClusterScopeFilterProvider],
  exports: [DbClusterService, MikroOrmModule],
})
export class DbClusterModule {}
