import { Injectable } from '@nestjs/common'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'
import { Uid } from '@shared/domain/entity/domain/uid'

@Injectable()
export class CliService {
  constructor(private readonly dbclusterService: DbClusterService) {}

  async dbClusterGetPassword(dbclusterUid: Uid<'dbcluster'>): Promise<string> {
    return await this.dbclusterService.getPassword(dbclusterUid)
  }

  async dbClusterRotatePassword(dbclusterUid: Uid<'dbcluster'>): Promise<string> {
    return await this.dbclusterService.rotatePassword(dbclusterUid)
  }
}
