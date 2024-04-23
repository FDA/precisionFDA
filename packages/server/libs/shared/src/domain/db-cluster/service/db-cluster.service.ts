import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { DbCluster } from '@shared/domain/db-cluster/db-cluster.entity'
import { ENGINE, ENGINES, STATUS, STATUSES } from '@shared/domain/db-cluster/db-cluster.enum'
import { CreateDbClusterDTO } from '@shared/domain/db-cluster/dto/CreateDbClusterDTO'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { User } from '@shared/domain/user/user.entity'
import { PlatformClient } from '@shared/platform-client'
import { DbClusterDescribeResponse } from '@shared/platform-client/platform-client.responses'
import { MainQueueJobProducer } from '@shared/queue/producer/main-queue-job.producer'
import { invertObj, omit } from 'ramda'

@Injectable()
export class DbClusterService {
  constructor(
    private readonly em: SqlEntityManager,
    private readonly user: UserContext,
    private readonly platformClient: PlatformClient,
    private readonly mainJobProducer: MainQueueJobProducer,
  ) {}

  async create(input: CreateDbClusterDTO) {
    const newCluster = await this.platformClient.dbClusterCreate({ ...omit(['scope', 'description'], input) } as any)

    const describeDbClusterRes = await this.platformClient.dbClusterDescribe({
      dxid: newCluster.id,
      project: input.project,
    })

    const dbCluster = await this.persistDbCluster(input, describeDbClusterRes)
    await this.mainJobProducer.createDbClusterSyncTask({ dxid: dbCluster.dxid }, this.user)

    return dbCluster
  }

  private async persistDbCluster(input: CreateDbClusterDTO, describeDbClusterRes: DbClusterDescribeResponse): Promise<DbCluster> {
    const dbCluster = this.em.create(DbCluster, {
      user: this.em.getReference(User, this.user.id),
      dxid: describeDbClusterRes.id,
      uid: `${describeDbClusterRes.id}-1`,
      name: describeDbClusterRes.name,
      status: STATUS[invertObj(STATUSES)[describeDbClusterRes.status]],
      project: describeDbClusterRes.project,
      dxInstanceClass: describeDbClusterRes.dxInstanceClass,
      engine: ENGINE[invertObj(ENGINES)[describeDbClusterRes.engine]],
      engineVersion: describeDbClusterRes.engineVersion,
      host: describeDbClusterRes.endpoint,
      port: describeDbClusterRes.port,
      scope: input.scope,
      description: input.description,
      statusAsOf: describeDbClusterRes.statusAsOf ? new Date(describeDbClusterRes.statusAsOf) : null,
    })

    await this.em.persistAndFlush(dbCluster)

    return dbCluster
  }
}
