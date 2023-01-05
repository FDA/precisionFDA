/* eslint-disable no-undefined */
import { EntityManager } from '@mikro-orm/core'
import { database, queue } from '@pfda/https-apps-shared'
import { User, DbCluster } from '@pfda/https-apps-shared/src/domain'
import { UserCtx } from '@pfda/https-apps-shared/src/types'
import { expect } from 'chai'
import { create, generate, db } from '@pfda/https-apps-shared/src/test'
import { fakes, mocksReset } from '@pfda/https-apps-shared/src/test/mocks'
import type { BasicUserJob } from '@pfda/https-apps-shared/src/queue/task.input'
import { JobOptions } from 'bull'
import {
  STATUS as DB_CLUSTER_STATUS,
} from '@pfda/https-apps-shared/src/domain/db-cluster/db-cluster.enum'
import { fakes as queueFakes, mocksReset as queueMocksReset } from '../utils/mocks'
import { SyncDbClusterOperation } from 'shared/src/domain/db-cluster'


const createUserCheckupTask = async (
  user: BasicUserJob['user'],
) => {
  const options: JobOptions = { jobId: `${queue.types.TASK_TYPE.USER_CHECKUP}` }
  const defaultTestQueue = queue.getStatusQueue()
  // .add() is stubbed by default
  await defaultTestQueue.add({
    type: queue.types.TASK_TYPE.USER_CHECKUP,
    user,
  }, options)
}

describe('TASK: check-user-dbs', () => {
  let em: EntityManager
  let user1: User
  let user2: User
  let userCtx1: UserCtx
  let userCtx2: UserCtx
  let dbClusters: DbCluster[]

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork()
    em.clear()
    user1 = create.userHelper.create(em)
    user2 = create.userHelper.create(em)
    dbClusters = [
      create.dbClusterHelper.create(em, { user: user1 }, { status: DB_CLUSTER_STATUS.AVAILABLE }),
      create.dbClusterHelper.create(em, { user: user1 }, { status: DB_CLUSTER_STATUS.STOPPED }),
      create.dbClusterHelper.create(em, { user: user1 }, { status: DB_CLUSTER_STATUS.TERMINATED }),
      create.dbClusterHelper.create(em, { user: user2 }, { status: DB_CLUSTER_STATUS.AVAILABLE }),
      create.dbClusterHelper.create(em, { user: user2 }, { status: DB_CLUSTER_STATUS.STOPPED }),
      create.dbClusterHelper.create(em, { user: user2 }, { status: DB_CLUSTER_STATUS.TERMINATED }),
    ]
    await em.flush()

    userCtx1 = { id: user1.id, dxuser: user1.dxuser, accessToken: 'fake-token' }
    userCtx2 = { id: user2.id, dxuser: user2.dxuser, accessToken: 'fake-token' }
    mocksReset()
    queueMocksReset()
  })

  it('adds db sync tasks to the queue', async () => {
    // Insert existing queue jobs
    const bullJobsInQueue = [
      generate.bullQueue.syncDbClusterStatus(dbClusters[0].dxid, userCtx1),
      generate.bullQueue.syncDbClusterStatus(dbClusters[3].dxid, userCtx2),
    ]
    fakes.queue.findRepeatableFake.callsFake((bullJobId: string): object | undefined => {
      const match = bullJobsInQueue.filter((job => SyncDbClusterOperation.getBullJobId(job.data.payload.dxid) === bullJobId))
      return match.length > 0 ? match[0] : undefined
    })

    // Check db clusters for user1
    await createUserCheckupTask(userCtx1)

    // Only dbClusters[1] belongs to user1, is non-terminated and doesn't have sync task
    expect(fakes.queue.createDbClusterSyncTaskFake.callCount).to.equal(1)
    const [payload1] = fakes.queue.createDbClusterSyncTaskFake.getCall(0).args
    expect(payload1).to.have.property('dxid', dbClusters[1].dxid)

    // Check db clusters for user2
    await createUserCheckupTask(userCtx2)

    // Only dbClusters[4] belongs to user2, is non-terminated and doesn't have sync task
    expect(fakes.queue.createDbClusterSyncTaskFake.callCount).to.equal(2)
    const [payload2] = fakes.queue.createDbClusterSyncTaskFake.getCall(1).args
    expect(payload2).to.have.property('dxid', dbClusters[4].dxid)
  })

  it('does nothing if all DbClusters already have sync task', async () => {
    // Insert existing queue jobs
    const bullJobsInQueue = dbClusters.map(dbCluster => {
      const userCtx = dbCluster.user.getEntity().id === user1.id ? userCtx1 : userCtx2
      return generate.bullQueue.syncDbClusterStatus(dbCluster.dxid, userCtx)
    })

    fakes.queue.findRepeatableFake.callsFake((bullJobId: string): object | undefined => {
      const match = bullJobsInQueue.filter((job => SyncDbClusterOperation.getBullJobId(job.data.payload.dxid) === bullJobId))
      return match.length > 0 ? match[0] : undefined
    })

    await createUserCheckupTask(userCtx1)
    expect(fakes.queue.createDbClusterSyncTaskFake.callCount).to.equal(0)

    await createUserCheckupTask(userCtx2)
    expect(fakes.queue.createDbClusterSyncTaskFake.callCount).to.equal(0)
  })
})
