import { Module } from '@nestjs/common'
import { DbClusterActionFacadeModule } from '../facade/db-cluster/action-facade/db-cluster-action-facade.module'
import { DbClusterCreateFacadeModule } from '../facade/db-cluster/create-facade/db-cluster-create-facade.module'
import { DbClusterGetFacadeModule } from '../facade/db-cluster/get-facade/db-cluster-get-facade.module'
import { DbClusterListFacadeModule } from '../facade/db-cluster/list-facade/db-cluster-list-facade.module'
import { DbClusterSynchronizeFacadeModule } from '../facade/db-cluster/synchronize-facade/db-cluster-synchronize-facade.module'
import { DbClusterUpdateFacadeModule } from '../facade/db-cluster/update-facade/db-cluster-update-facade.module'
import { DbClusterController } from './dbcluster.controller'

@Module({
  imports: [
    DbClusterSynchronizeFacadeModule,
    DbClusterCreateFacadeModule,
    DbClusterUpdateFacadeModule,
    DbClusterActionFacadeModule,
    DbClusterGetFacadeModule,
    DbClusterListFacadeModule,
  ],
  controllers: [DbClusterController],
})
export class DbClusterApiModule {}
