import { Injectable } from '@nestjs/common'
import { DbCluster } from '@shared/domain/db-cluster/db-cluster.entity'
import { EntityLinkProvider } from '@shared/domain/entity/entity-link/entity-link.provider'

@Injectable()
export class DBClusterEntityLinkProvider extends EntityLinkProvider<'dbcluster'> {
  protected async getRelativeLink(dbcluster: DbCluster) {
    return `/home/databases/${dbcluster.dxid}` as const
  }
}
