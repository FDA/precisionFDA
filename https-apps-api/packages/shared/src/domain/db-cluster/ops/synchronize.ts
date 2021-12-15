import { wrap } from '@mikro-orm/core'
import { invertObj } from 'ramda'
import { SyncDbClusterJob } from '../../../queue/task.input'
import { WorkerBaseOperation } from '../../../utils/base-operation'
import { PlatformClient, DbClusterDescribeResponse } from '../../../platform-client'
import { removeRepeatable } from '../../../queue'
import type { Maybe } from '../../../types'
import { DbCluster, User } from '../..'
import { errors } from '../../..'
import { STATUS, STATUSES } from '../db-cluster.enum'

export class SyncDbClusterOperation extends WorkerBaseOperation<SyncDbClusterJob['payload'], Maybe<DbCluster>> {
  async run(input: SyncDbClusterJob['payload']): Promise<Maybe<DbCluster>> {
    const em = this.ctx.em
    const dbCluster = await em.findOne(DbCluster, { dxid: input.dxid })
    const user = await em.findOne(User, { id: this.ctx.user.id })

    if (!dbCluster) {
      this.ctx.log.warn({ input }, 'Error: DB Cluster does not exist')
      await removeRepeatable(this.ctx.job)
      return
    }

    if (!user) {
      this.ctx.log.warn({ input }, 'Error: User does not exist')
      await removeRepeatable(this.ctx.job)
      return
    }

    const client = new PlatformClient(this.ctx.log)
    this.ctx.log.info({ dbClusterId: dbCluster.id }, 'SyncDbClusterOperation: Processing job')

    if (dbCluster.status === STATUS.TERMINATED) {
      this.ctx.log.info({ input, dbCluster },
        'SyncDbClusterOperation: DB Cluster already has terminated status. Removing task')
      await removeRepeatable(this.ctx.job)
      return
    }

    let describeDbClusterRes: DbClusterDescribeResponse
    try {
      describeDbClusterRes = await client.dbClusterDescribe({
        dxid: dbCluster.dxid,
        project: dbCluster.project,
        accessToken: this.ctx.user.accessToken,
      })
    } catch (err) {
      if (err instanceof errors.ClientRequestError) {
        // we retrieved response status code
        if (err.props?.clientStatusCode && err.props?.clientStatusCode >= 500) {
          // there was an error on platform side, we will retry later
          this.ctx.log.info({ error: err.props },
            'SyncDbClusterOperation: Will not remove this job - 5xx error code detected')
          return
        }
      }

      this.ctx.log.info({ error: err.props },
        'SyncDbClusterOperation: Error on dbcluster/describe Removing sync job task')
      await removeRepeatable(this.ctx.job)
      return
    }

    this.ctx.log.info({ data: describeDbClusterRes },
      'SyncDbClusterOperation: Received dbcluster describe response from platform')

    const currentStatus = STATUSES[invertObj(STATUS)[dbCluster.status]]

    if (currentStatus === describeDbClusterRes.status &&
        dbCluster.host === describeDbClusterRes.endpoint &&
        dbCluster.port === describeDbClusterRes.port.toString()) {
      this.ctx.log.info({ dxid: dbCluster.dxid },
        'SyncDbClusterOperation: Status, endpoint or port have not been changed, no updates')
      return
    }

    this.ctx.log.info({
      dxid: dbCluster.dxid,
      fromState: currentStatus,
      toState: describeDbClusterRes.status,
    }, 'SyncDbClusterOperation: Updating dbcluster properties from the platform')

    const updatedDbCluster = wrap(dbCluster).assign(
      {
        status: STATUS[invertObj(STATUSES)[describeDbClusterRes.status]],
        statusAsOf: new Date(describeDbClusterRes.statusAsOf),
        host: describeDbClusterRes.endpoint,
        port: describeDbClusterRes.port.toString(),
      },
      { em },
    )
    await em.flush()

    this.ctx.log.debug({ dbCluster: updatedDbCluster }, 'SyncDbClusterOperation: Updated dbcluster')
  }
}
