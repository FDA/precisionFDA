import { omit, invertObj } from 'ramda'
import { EntityManager } from '@mikro-orm/mysql'
import { BaseOperation } from '../../../utils'
import * as client from '../../../platform-client'
import type { CreateDbClusterInput } from '../db-cluster.input'
import { DbCluster } from '../db-cluster.entity'
import { User } from '../../user'
import { STATUS, ENGINE, STATUSES, ENGINES } from '../db-cluster.enum'
import { createDbClusterSyncTask } from '../../../queue'
import { UserOpsCtx } from '../../../types'

export class CreateDbClusterOperation extends BaseOperation<UserOpsCtx, CreateDbClusterInput, DbCluster> {
  private input: CreateDbClusterInput
  private em: EntityManager

  async run(input: CreateDbClusterInput): Promise<DbCluster> {
    this.input = input
    this.em = this.ctx.em

    const platformClient = new client.PlatformClient(this.ctx.log)

    const user = await this.em.findOne(User, { id: this.ctx.user.id })

    const newDbClusterRes: client.ClassIdResponse
      = await platformClient.dbClusterCreate(this.buildCreateApiCall())

    const describeDbClusterRes: client.DbClusterDescribeResponse
      = await platformClient.dbClusterDescribe({
        dxid: newDbClusterRes.id,
        project: input.project,
        accessToken: this.ctx.user.accessToken,
      })

    const dbCluster: DbCluster = await this.persistDbCluster(describeDbClusterRes)

    await createDbClusterSyncTask({ dxid: dbCluster.dxid }, this.ctx.user)

    return dbCluster
  }

  private buildCreateApiCall(): client.DbClusterCreateParams {
    const payload: client.DbClusterCreateParams = {
      accessToken: this.ctx.user.accessToken,
      ...omit(['scope', 'description'], this.input),
    }
    return payload
  }

  private async persistDbCluster(describeDbClusterRes: client.DbClusterDescribeResponse): Promise<DbCluster> {
    const dbCluster = this.em.create(DbCluster, {
      user: this.em.getReference(User, this.ctx.user.id),
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
      scope: this.input.scope,
      description: this.input.description,
      statusAsOf: new Date(describeDbClusterRes.statusAsOf),
    })

    await this.em.persistAndFlush(dbCluster)

    return dbCluster
  }
}
