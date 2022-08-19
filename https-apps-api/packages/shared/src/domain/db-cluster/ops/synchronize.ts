import { wrap } from '@mikro-orm/core'
import { invertObj } from 'ramda'
import { SyncDbClusterJob, TASK_TYPE } from '../../../queue/task.input'
import { WorkerBaseOperation } from '../../../utils/base-operation'
import { PlatformClient, DbClusterDescribeResponse } from '../../../platform-client'
import { removeRepeatable } from '../../../queue'
import type { Maybe, UserOpsCtx } from '../../../types'
import { DbCluster, User } from '../..'
import { errors } from '../../..'
import { STATUS, STATUSES } from '../db-cluster.enum'

export class SyncDbClusterOperation extends WorkerBaseOperation<
UserOpsCtx,
SyncDbClusterJob['payload'],
Maybe<DbCluster>
> {
  static getBullJobId(dbClusterDxId: string): string {
    return `${TASK_TYPE.SYNC_DBCLUSTER_STATUS}.${dbClusterDxId}`
  }

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
      this.ctx.log.info(
        { input, dbCluster },
        'SyncDbClusterOperation: DB Cluster already has terminated status. Removing task',
      )
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
      if (err instanceof errors.ClientRequestError && err.props?.clientStatusCode) {
        if (err.props.clientStatusCode === 401) {
          // Unauthorized. Expected scenario is that the user token has expired
          // Removing the sync task will allow a new sync task to be recreated
          // when user next logs in via UserCheckupTask
          this.ctx.log.info({ error: err.props },
            'SyncDbClusterOperation: Received 401 from platform, removing sync task')
          await removeRepeatable(this.ctx.job)
        }
      }
      else {
        this.ctx.log.info({ error: err },
          'SyncDbClusterOperation: Unhandled error from dbcluster/describe, will retry later')
      }
      return
    }

    this.ctx.log.info(
      { data: describeDbClusterRes },
      'SyncDbClusterOperation: Received dbcluster describe response from platform',
    )

    const currentStatus = STATUSES[invertObj(STATUS)[dbCluster.status]]

    if (currentStatus === describeDbClusterRes.status
        // TODO(samuel) validate if there is some possible type mismatch - if you git blame properly I didn't code it, just ran eslint
        && dbCluster.host == describeDbClusterRes.endpoint
        && dbCluster.port == describeDbClusterRes.port?.toString()) {
      this.ctx.log.info(
        { dxid: dbCluster.dxid },
        'SyncDbClusterOperation: Status, endpoint or port have not been changed, no updates',
      )
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
        port: describeDbClusterRes.port?.toString(),
      },
      { em },
    )
    await em.flush()

    this.ctx.log.debug({ dbCluster: updatedDbCluster }, 'SyncDbClusterOperation: Updated dbcluster')
  }
}
