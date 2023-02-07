import { EntityManager } from '@mikro-orm/core'
import { database, queue } from '@pfda/https-apps-shared'
import { DbCluster, User } from '@pfda/https-apps-shared/src/domain'
import { expect } from 'chai'
import {
  STATUS as DB_CLUSTER_STATUS,
} from '@pfda/https-apps-shared/src/domain/db-cluster/db-cluster.enum'
import { create, db } from '@pfda/https-apps-shared/src/test'
import { fakes, mocksReset } from '@pfda/https-apps-shared/src/test/mocks'
import { UserCtx } from '@pfda/https-apps-shared/src/types'
import { TASK_TYPE } from 'shared/src/queue/task.input'
import { fakes as queueFakes, mocksReset as queueMocksReset } from '../utils/mocks'
import { EMAIL_TYPES } from 'shared/src/domain/email/email.config'



const createCheckDbClusterTestTask = async (
  user: UserCtx,
) => {
  const defaultTestQueue = queue.getStatusQueue()
  await defaultTestQueue.add({
    type: queue.types.TASK_TYPE.CHECK_NON_TERMINATED_DBCLUSTERS,
    undefined,
    user,
  })
}

describe('TASK: check-non-terminated', () => {
  let em: EntityManager
  let adminUser: User
  let user1: User
  let user2: User
  let dbClusters: DbCluster[]

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork()
    em.clear()
    adminUser = create.userHelper.createAdmin(em)
    user1 = create.userHelper.create(em)
    user2 = create.userHelper.create(em)
    dbClusters = [
      create.dbClusterHelper.create(em, { user: user1 }, { status: DB_CLUSTER_STATUS.STARTING }),
      create.dbClusterHelper.create(em, { user: user1 }, { status: DB_CLUSTER_STATUS.STOPPED }),
      create.dbClusterHelper.create(em, { user: user1 }, { status: DB_CLUSTER_STATUS.TERMINATED }),
      create.dbClusterHelper.create(em, { user: user2 }, { status: DB_CLUSTER_STATUS.AVAILABLE }),
      create.dbClusterHelper.create(em, { user: user2 }, { status: DB_CLUSTER_STATUS.STOPPING }),
      create.dbClusterHelper.create(em, { user: user2 }, { status: DB_CLUSTER_STATUS.TERMINATED }),
    ]
    await em.flush()

    mocksReset()
    queueMocksReset()
  })

  it('runs and sends an email with non-terminated db clusters', async () => {
    await createCheckDbClusterTestTask({ id: adminUser.id, dxuser: adminUser.dxuser, accessToken: 'fake-token' })

    expect(queueFakes.addToQueueStub.callCount).to.equal(1)
    expect(fakes.queue.createEmailSendTaskFake.callCount).to.equal(2)

    let call = fakes.queue.createEmailSendTaskFake.getCall(0)
    expect(call.args[0].emailType).to.equal(EMAIL_TYPES.nonTerminatedDbClusters)
    const nonTerminatedIndexes = [0, 1, 3, 4]
    nonTerminatedIndexes.forEach(index => {
      expect(call.args[0].body).to.contain(dbClusters[index].dxid)
    })

    call = fakes.queue.createEmailSendTaskFake.getCall(1)
    expect(call.args[0].emailType).to.equal(EMAIL_TYPES.nonTerminatedDbClusters)
    nonTerminatedIndexes.forEach(index => {
      expect(call.args[0].body).to.contain(dbClusters[index].dxid)
    })
  })
})
