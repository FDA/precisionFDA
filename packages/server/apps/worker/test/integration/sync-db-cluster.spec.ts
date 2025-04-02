import { expect } from 'chai'
import { Job } from 'bull'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'
import { STATUS } from '@shared/domain/db-cluster/db-cluster.enum'
import { SyncDbClusterJob, TASK_TYPE } from '@shared/queue/task.input'
import sinon, { stub } from 'sinon'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { PlatformClient } from '@shared/platform-client'
import { MainQueueJobProducer } from '@shared/queue/producer/main-queue-job.producer'
import { EmailQueueJobProducer } from '@shared/domain/email/producer/email-queue-job.producer'
import { DbClusterRepository } from '@shared/domain/db-cluster/db-cluster.repository'
import { UserRepository } from '@shared/domain/user/user.repository'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { UsersDbClustersSaltRepository } from '@shared/domain/db-cluster/access-control/users-db-clusters-salt.repository'

describe('DbClusterService', () => {
  let removeRepeatableStub: sinon.SinonStub
  let originalRemoveRepeatable

  const USER_ID = 0
  const USER = {
    id: USER_ID,
  }

  const em = {} as unknown as SqlEntityManager
  const USER_CTX: UserCtx = { ...USER, accessToken: 'accessToken', dxuser: 'dxuser' }
  const dbClusterDescribe = stub()
  const userClient = {
    dbClusterDescribe: dbClusterDescribe,
  } as unknown as PlatformClient
  const mainJobProducer = {} as unknown as MainQueueJobProducer
  const emailQueueJobProducer = {} as unknown as EmailQueueJobProducer
  const dbfindOne = stub()
  const entityManagerStub = {
    flush: stub().resolves(),
    persist: stub().resolves(),
  }
  const getEntityManager = stub().returns(entityManagerStub)
  const dbClusterRepository = {
    findOne: dbfindOne,
    getEntityManager: getEntityManager,
  } as unknown as DbClusterRepository
  const userfindOne = stub()
  const userRepository = {
    findOne: userfindOne,
  } as unknown as UserRepository
  const spaceRepository = {} as unknown as SpaceRepository
  const spaceMembershipRepository = {} as unknown as SpaceMembershipRepository
  const saltRepository = {} as unknown as UsersDbClustersSaltRepository
  const adminClient = {
    dbClusterDescribe: dbClusterDescribe,
  } as unknown as PlatformClient

  const logStub = stub()
  const warnStub = stub()

  beforeEach(async () => {
    removeRepeatableStub = stub()

    removeRepeatableStub.resolves()

    // Replace the original removeRepeatable function
    originalRemoveRepeatable = require('@shared/queue').removeRepeatable
    require('@shared/queue').removeRepeatable = removeRepeatableStub
  })

  afterEach(() => {
    // Restore the original removeRepeatable function
    require('@shared/queue').removeRepeatable = originalRemoveRepeatable
  })

  describe('#syncDbClusterStatus', () => {
    it('should call removeRepeatable if dbCluster status is TERMINATED', async () => {
      const job = {
        type: TASK_TYPE.SYNC_DBCLUSTER_STATUS,
        data: { payload: { dxid: 'dbcluster-1' }, user: { id: 1 } },
      } as unknown as Job<SyncDbClusterJob>

      dbfindOne.resolves({ status: STATUS.TERMINATED })
      userfindOne.resolves({ id: 1 })

      await getInstance().syncDbClusterStatus(job)
      expect(removeRepeatableStub.calledOnceWith(job)).to.be.true()
    })

    it('should not update local database if remote properties are the same', async () => {
      const job = {
        type: TASK_TYPE.SYNC_DBCLUSTER_STATUS,
        data: { payload: { dxid: 'dbcluster-1' }, user: { id: 1 } },
      } as unknown as Job<SyncDbClusterJob>

      dbfindOne.resolves({
        dxid: 'dbcluster-1',
        status: STATUS.AVAILABLE,
        host: 'dbcluster.com',
        port: '5432',
      })
      userfindOne.resolves({ id: 1 })
      dbClusterDescribe.resolves({
        status: 'available',
        endpoint: 'dbcluster.com',
        port: '5432',
      })

      const service = getInstance()
      // Replace the logger's log method
      Object.defineProperty(service, 'logger', {
        value: { log: logStub, warn: warnStub },
        writable: true,
      })
      await service.syncDbClusterStatus(job)
      sinon.assert.callOrder(dbfindOne, userfindOne, dbClusterDescribe)
      expect(logStub.callCount).to.equal(4)
      sinon.assert.calledWith(
        logStub.lastCall,
        { dxid: 'dbcluster-1' },
        'Status, endpoint or port have not been changed, no updates',
      )
    })

    context('error states', () => {
      it('should call removeRepeatable when db cluster is not found', async () => {
        const job = {
          type: TASK_TYPE.SYNC_DBCLUSTER_STATUS,
          data: { payload: { dxid: 'dbcluster-1' }, user: { id: 1 } },
        } as unknown as Job<SyncDbClusterJob>

        dbfindOne.resolves(null)
        userfindOne.resolves({ id: 1 })

        await getInstance().syncDbClusterStatus(job)
        expect(removeRepeatableStub.calledOnceWith(job)).to.be.true()
      })

      it('should call removeRepeatable when user is not found', async () => {
        const job = {
          type: TASK_TYPE.SYNC_DBCLUSTER_STATUS,
          data: { payload: { dxid: 'dbcluster-1' }, user: { id: 1 } },
        } as unknown as Job<SyncDbClusterJob>

        dbfindOne.resolves({ id: 1 })
        userfindOne.resolves(null)

        await getInstance().syncDbClusterStatus(job)
        expect(removeRepeatableStub.calledOnceWith(job)).to.be.true()
      })
    })
  })

  function getInstance() {
    return new DbClusterService(
      em,
      USER_CTX,
      userClient,
      mainJobProducer,
      emailQueueJobProducer,
      dbClusterRepository,
      userRepository,
      spaceRepository,
      spaceMembershipRepository,
      saltRepository,
      adminClient,
    )
  }
})
