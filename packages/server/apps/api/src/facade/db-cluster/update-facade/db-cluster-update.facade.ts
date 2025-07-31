import { Injectable, Logger } from '@nestjs/common'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { NotFoundError } from '@shared/errors'
import { Uid } from '@shared/domain/entity/domain/uid'
import { UpdateDbClusterDTO } from '@shared/domain/db-cluster/dto/update-db-cluster.dto'

@Injectable()
export class DbClusterUpdateFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly dbClusterService: DbClusterService,
    private readonly userContext: UserContext,
  ) {}

  async updateDbCluster(uid: Uid<'dbcluster'>, body: UpdateDbClusterDTO): Promise<void> {
    this.logger.log({ body: body, userId: this.userContext.id }, 'Updating DbCluster')

    const dbCluster = await this.dbClusterService.getEditableByUid(uid)
    if (!dbCluster) {
      this.logger.warn(
        { userId: this.userContext.id, dbClusterUid: uid },
        `DbCluster does not exist or is not editable by user.`,
      )
      throw new NotFoundError('DbCluster not found or not editable')
    }

    return await this.dbClusterService.updateDbClusterProperties(
      dbCluster,
      body.name,
      body.description,
    )
  }
}
