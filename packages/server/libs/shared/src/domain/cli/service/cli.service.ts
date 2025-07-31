import { Injectable } from '@nestjs/common'
import { Uid } from '@shared/domain/entity/domain/uid'
import { DbClusterPasswordFacade } from 'apps/api/src/facade/db-cluster/password-facade/db-cluster-password.facade'

@Injectable()
export class CliService {
  constructor(private readonly dbClusterPasswordFacade: DbClusterPasswordFacade) {}

  async dbClusterGetPassword(dbclusterUid: Uid<'dbcluster'>): Promise<string> {
    return await this.dbClusterPasswordFacade.getPassword(dbclusterUid)
  }

  async dbClusterRotatePassword(dbclusterUid: Uid<'dbcluster'>): Promise<string> {
    return await this.dbClusterPasswordFacade.rotatePassword(dbclusterUid)
  }
}
