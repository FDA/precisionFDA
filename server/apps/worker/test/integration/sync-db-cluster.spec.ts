import { database } from '@shared/database'
import { DbCluster } from '@shared/domain/db-cluster/db-cluster.entity'
import { User } from '@shared/domain/user/user.entity'
import { ClientRequestError } from '@shared/errors'
import { getMainQueue } from '@shared/queue'
import { TASK_TYPE } from '@shared/queue/task.input'
import { invertObj } from 'ramda'
import { EntityManager } from '@mikro-orm/core'
import type { SyncDbClusterJob } from '@shared/queue/task.input'
import { expect } from 'chai'
import { create, generate, db, mockResponses } from '@shared/test'
import { fakes, mocksReset } from '@shared/test/mocks'
import { STATUS, STATUSES } from '@shared/domain/db-cluster/db-cluster.enum'
import { fakes as queueFakes, mocksReset as queueMocksReset } from '../utils/mocks'
import { errorsFactory } from '../utils/errors-factory'

const createSyncDbClusterTestTask = async (
  payload: SyncDbClusterJob['payload'],
  user: SyncDbClusterJob['user'],
) => {
  const defaultTestQueue = getMainQueue()
  await defaultTestQueue.add(TASK_TYPE.SYNC_DBCLUSTER_STATUS, {
    type: TASK_TYPE.SYNC_DBCLUSTER_STATUS,
    payload,
    user,
  })
}

describe('TASK: sync db cluster', () => {
  let em: EntityManager
  let user: User
  let dbCluster: DbCluster

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork()
    em.clear()
    user = create.userHelper.create(em)
    dbCluster = create.dbClusterHelper.create(em, { user })
    await em.flush()
    mocksReset()
    queueMocksReset()
  })

  it('processes a queue task - calls the queue handlers', async () => {
    await createSyncDbClusterTestTask(
      { dxid: dbCluster.dxid },
      { id: user.id, dxuser: user.dxuser, accessToken: 'fake-token' },
    )
    expect(queueFakes.addToQueueStub.calledOnce).to.be.true()
  })

  it('removes task from queue when db cluster has terminated status', async () => {
    dbCluster.status = STATUS.TERMINATED
    await em.flush()

    await createSyncDbClusterTestTask(
      { dxid: dbCluster.dxid },
      { id: user.id, dxuser: user.dxuser, accessToken: 'fake-token' },
    )

    expect(fakes.client.dbClusterDescribeFake.notCalled).to.be.true()
    expect(fakes.queue.removeRepeatableFake.calledOnce).to.be.true()
  })

  it('does not update local database if remote properties are the same', async () => {
    const describeCallRes = {
      ...mockResponses.DBCLUSTER_DESC_RES,
      endpoint: dbCluster.host,
      port: dbCluster.port,
      status: STATUSES[invertObj(STATUS)[dbCluster.status]],
      id: dbCluster.dxid,
    }

    fakes.client.dbClusterDescribeFake.onCall(0).returns(describeCallRes)

    await createSyncDbClusterTestTask(
      { dxid: dbCluster.dxid },
      { id: user.id, dxuser: user.dxuser, accessToken: 'fake-token' },
    )

    expect(fakes.client.dbClusterDescribeFake.calledOnce).to.be.true()

    const afterEm = em.fork()
    const notUpdated = await afterEm.findOne(DbCluster, dbCluster.id)
    expect(notUpdated.updatedAt.getTime()).to.be.equal(dbCluster.updatedAt.getTime())
  })

  it('updates local database if remote port is different', async () => {
    const remotePort = parseInt(dbCluster.port) + 1
    const describeCallRes = {
      ...mockResponses.DBCLUSTER_DESC_RES,
      endpoint: dbCluster.host,
      port: remotePort,
      status: STATUSES[invertObj(STATUS)[dbCluster.status]],
      id: dbCluster.dxid,
    }

    fakes.client.dbClusterDescribeFake.onCall(0).returns(describeCallRes)

    await createSyncDbClusterTestTask(
      { dxid: dbCluster.dxid },
      { id: user.id, dxuser: user.dxuser, accessToken: 'fake-token' },
    )

    expect(fakes.client.dbClusterDescribeFake.calledOnce).to.be.true()

    const afterEm = em.fork()
    const updated = await afterEm.findOne(DbCluster, dbCluster.id)
    expect(updated.updatedAt.getTime()).to.not.be.equal(dbCluster.updatedAt.getTime())
    expect(updated).to.have.property('port').that.is.equal(remotePort.toString())
  })

  it('updates local database if remote host is different', async () => {
    const remoteHost = `${dbCluster.port}diff`
    const describeCallRes = {
      ...mockResponses.DBCLUSTER_DESC_RES,
      endpoint: remoteHost,
      port: dbCluster.port,
      status: STATUSES[invertObj(STATUS)[dbCluster.status]],
      id: dbCluster.dxid,
    }

    fakes.client.dbClusterDescribeFake.onCall(0).returns(describeCallRes)

    await createSyncDbClusterTestTask(
      { dxid: dbCluster.dxid },
      { id: user.id, dxuser: user.dxuser, accessToken: 'fake-token' },
    )

    expect(fakes.client.dbClusterDescribeFake.calledOnce).to.be.true()

    const afterEm = em.fork()
    const updated = await afterEm.findOne(DbCluster, dbCluster.id)
    expect(updated.updatedAt.getTime()).to.not.be.equal(dbCluster.updatedAt.getTime())
    expect(updated).to.have.property('host').that.is.equal(remoteHost)
  })

  it('updates local database if remote status is different', async () => {
    const describeCallRes = {
      ...mockResponses.DBCLUSTER_DESC_RES,
      endpoint: dbCluster.host,
      port: dbCluster.port,
      status: STATUSES.STOPPED,
      id: dbCluster.dxid,
    }

    fakes.client.dbClusterDescribeFake.onCall(0).returns(describeCallRes)

    await createSyncDbClusterTestTask(
      { dxid: dbCluster.dxid },
      { id: user.id, dxuser: user.dxuser, accessToken: 'fake-token' },
    )

    expect(fakes.client.dbClusterDescribeFake.calledOnce).to.be.true()

    const afterEm = em.fork()
    const updated = await afterEm.findOne(DbCluster, dbCluster.id)
    expect(updated.updatedAt.getTime()).to.not.be.equal(dbCluster.updatedAt.getTime())
    expect(updated).to.have.property('status').that.is.equal(STATUS.STOPPED)
  })

  context('error states', () => {
    it('removes task from queue when db cluster is not found', async () => {
      const fakeDbClusterDxid = `dbcluster-${generate.random.dxstr()}`
      await createSyncDbClusterTestTask(
        { dxid: fakeDbClusterDxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'fake-token' },
      )
      expect(fakes.queue.removeRepeatableFake.calledOnce).to.be.true()
      expect(fakes.client.dbClusterDescribeFake.notCalled).to.be.true()
    })

    it('removes task from queue when user is not found', async () => {
      await createSyncDbClusterTestTask(
        { dxid: dbCluster.dxid },
        { id: user.id + 1, dxuser: 'fake-dxuser', accessToken: 'fake-token' },
      )
      expect(fakes.queue.removeRepeatableFake.calledOnce).to.be.true()
      expect(fakes.client.dbClusterDescribeFake.notCalled).to.be.true()
    })

    it('it handles InvalidAuthentication - ExpiredToken gracefully', async () => {
      fakes.client.dbClusterDescribeFake.rejects(errorsFactory.createClientTokenExpiredError())
      await createSyncDbClusterTestTask(
        { dxid: dbCluster.dxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'fake-token' },
      )
      expect(fakes.client.dbClusterDescribeFake.calledOnce).to.be.true()
      expect(fakes.queue.removeRepeatableFake.calledOnce).to.be.true()
    })

    it('it handles ClientRequestError gracefully', async () => {
      fakes.client.dbClusterDescribeFake.rejects(errorsFactory.createServiceUnavailableError())
      await createSyncDbClusterTestTask(
        { dxid: dbCluster.dxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'fake-token' },
      )
      expect(fakes.client.dbClusterDescribeFake.calledOnce).to.be.true()
      expect(fakes.queue.removeRepeatableFake.notCalled).to.be.true()
    })

    it('it handles other errors gracefully', async () => {
      fakes.client.dbClusterDescribeFake.rejects(new Error('quack'))
      await createSyncDbClusterTestTask(
        { dxid: dbCluster.dxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'fake-token' },
      )
      expect(fakes.queue.removeRepeatableFake.notCalled).to.be.true()
    })

    it('does not remove task from queue when client API call returns 5xx error', async () => {
      fakes.client.dbClusterDescribeFake.rejects(
        new ClientRequestError('client error', {
          clientResponse: {},
          clientStatusCode: 500,
        }),
      )
      await createSyncDbClusterTestTask(
        { dxid: dbCluster.dxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'fake-token' },
      )
      expect(fakes.queue.removeRepeatableFake.notCalled).to.be.true()
    })
  })
})
