import { expect } from 'chai'
import { Job } from 'bull'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'
import { STATUS } from '@shared/domain/db-cluster/db-cluster.enum'
import { SyncDbClusterJob, TASK_TYPE } from '@shared/queue/task.input'
import sinon, { match, stub } from 'sinon'
import { EntityManager } from '@mikro-orm/mysql'
import { PlatformClient } from '@shared/platform-client'
import { MainQueueJobProducer } from '@shared/queue/producer/main-queue-job.producer'
import { DbClusterRepository } from '@shared/domain/db-cluster/db-cluster.repository'
import { DbClusterSynchronizeFacade } from 'apps/api/src/facade/db-cluster/synchronize-facade/db-cluster-synchronize.facade'
import { UserService } from '@shared/domain/user/user.service'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { UsersDbClustersSaltService } from '@shared/domain/db-cluster/access-control/users-db-clusters-salt.service'
import { create, db } from '@shared/test'
import { database } from '@shared/database'
import { User } from '@shared/domain/user/user.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { NOTIFICATION_ACTION } from '@shared/enums'

describe('DbClusterService', () => {
  let removeRepeatableStub: sinon.SinonStub
  let originalRemoveRepeatable
  let em: EntityManager
  let user: User
  let userContext: UserContext

  const logStub = stub()
  const warnStub = stub()
  const debugStub = stub()

  const getUserByIdStub = stub()
  const dbClusterDescribeStub = stub()
  const findAccessibleOneStub = stub()
  const createNotificationStub = stub()

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager
    em.clear()
    user = create.userHelper.create(em, { dxuser: 'test.test' })
    await em.flush()

    userContext = {
      id: user.id,
      dxuser: user.dxuser,
      accessToken: 'token',
    } as unknown as UserContext

    removeRepeatableStub = stub()

    removeRepeatableStub.resolves()

    logStub.reset()

    // Replace the original removeRepeatable function
    originalRemoveRepeatable = require('@shared/queue').removeRepeatable
    require('@shared/queue').removeRepeatable = removeRepeatableStub
    findAccessibleOneStub.reset()
    findAccessibleOneStub.throws()

    getUserByIdStub.reset()
    getUserByIdStub.throws()
    dbClusterDescribeStub.reset()
    dbClusterDescribeStub.throws()
    createNotificationStub.reset()
    createNotificationStub.throws()
  })

  afterEach(() => {
    // Restore the original removeRepeatable function
    require('@shared/queue').removeRepeatable = originalRemoveRepeatable
  })

  describe('#syncDbClusterStatus', () => {
    it('should call removeRepeatable if dbCluster status is TERMINATED', async () => {
      const dbCluster = create.dbClusterHelper.create(
        em,
        { user },
        { name: 'db-cluster-1', status: STATUS.TERMINATED, scope: 'private' },
      )
      const job = {
        type: TASK_TYPE.SYNC_DBCLUSTER_STATUS,
        data: { payload: { dxid: dbCluster.dxid }, user: { id: user.id } },
      } as unknown as Job<SyncDbClusterJob>

      getUserByIdStub.withArgs(user.id).resolves(user)
      findAccessibleOneStub.withArgs({ dxid: dbCluster.dxid }).resolves(dbCluster)

      await getInstance().syncDbClusterStatus(job)
      expect(removeRepeatableStub.calledOnceWith(job)).to.be.true()
    })

    it('should not update local database if remote properties are the same', async () => {
      const dbCluster = create.dbClusterHelper.create(
        em,
        { user },
        { name: 'db-cluster-1', status: STATUS.AVAILABLE, scope: 'private' },
      )
      const job = {
        type: TASK_TYPE.SYNC_DBCLUSTER_STATUS,
        data: { payload: { dxid: dbCluster.dxid }, user: { id: user.id } },
      } as unknown as Job<SyncDbClusterJob>

      getUserByIdStub.withArgs(user.id).resolves(user)
      findAccessibleOneStub.withArgs({ dxid: dbCluster.dxid }).resolves(dbCluster)

      dbClusterDescribeStub
        .withArgs({ dxid: dbCluster.dxid, project: dbCluster.project })
        .resolves({
          status: 'available',
          endpoint: dbCluster.host,
          port: dbCluster.port,
        })

      const service = getInstance()
      // Replace the logger's log method
      Object.defineProperty(service, 'logger', {
        value: { log: logStub, warn: warnStub },
        writable: true,
      })
      await service.syncDbClusterStatus(job)
      sinon.assert.callOrder(getUserByIdStub, dbClusterDescribeStub)
      expect(logStub.callCount).to.equal(4)
      sinon.assert.calledWith(
        logStub.lastCall,
        { dxid: dbCluster.dxid },
        'Status, endpoint or port have not been changed, no updates',
      )
    })

    it('should update local database if remote properties changed', async () => {
      const dbCluster = create.dbClusterHelper.create(
        em,
        { user },
        { name: 'db-cluster-1', status: STATUS.AVAILABLE, scope: 'private' },
      )
      const job = {
        type: TASK_TYPE.SYNC_DBCLUSTER_STATUS,
        data: { payload: { dxid: dbCluster.dxid }, user: { id: user.id } },
      } as unknown as Job<SyncDbClusterJob>

      getUserByIdStub.withArgs(user.id).resolves(user)
      findAccessibleOneStub.withArgs({ dxid: dbCluster.dxid }).resolves(dbCluster)

      dbClusterDescribeStub
        .withArgs({ dxid: dbCluster.dxid, project: dbCluster.project })
        .resolves({
          status: 'terminated',
          endpoint: dbCluster.host,
          port: 1111,
        })

      createNotificationStub
        .withArgs(
          match({
            action: NOTIFICATION_ACTION.DB_CLUSTER_UPDATED,
            userId: userContext.id,
          }),
        )
        .resolves({})

      const service = getInstance()
      // Replace the logger's log method
      Object.defineProperty(service, 'logger', {
        value: { log: logStub, warn: warnStub, debug: debugStub },
        writable: true,
      })
      await service.syncDbClusterStatus(job)
      sinon.assert.callOrder(getUserByIdStub, dbClusterDescribeStub)
      expect(logStub.callCount).to.equal(4)
      sinon.assert.calledWith(debugStub.lastCall, { dbCluster: dbCluster }, 'Updated DbCluster')
      expect(dbCluster.port).to.equal('1111')
      expect(createNotificationStub.callCount).to.equal(1)
    })

    describe('error states', () => {
      it('should call removeRepeatable when db cluster is not found', async () => {
        const job = {
          type: TASK_TYPE.SYNC_DBCLUSTER_STATUS,
          data: { payload: { dxid: 'dbcluster-1' }, user: { id: 1 } },
        } as unknown as Job<SyncDbClusterJob>

        getUserByIdStub.withArgs(user.id).resolves(user)
        findAccessibleOneStub.withArgs({ dxid: 'dbcluster-1' }).resolves(null)

        await getInstance().syncDbClusterStatus(job)
        expect(removeRepeatableStub.calledOnceWith(job)).to.be.true()
      })

      it('should call removeRepeatable when user is not found', async () => {
        const dbCluster = create.dbClusterHelper.create(
          em,
          { user },
          { name: 'db-cluster-1', status: STATUS.AVAILABLE, scope: 'private' },
        )
        const job = {
          type: TASK_TYPE.SYNC_DBCLUSTER_STATUS,
          data: { payload: { dxid: dbCluster.dxid }, user: { id: user.id } },
        } as unknown as Job<SyncDbClusterJob>

        getUserByIdStub.withArgs(user.id).resolves(null)

        await getInstance().syncDbClusterStatus(job)
        expect(removeRepeatableStub.calledOnceWith(job)).to.be.true()
      })
    })
  })

  function getInstance(): DbClusterSynchronizeFacade {
    const dbClusterRepo = {
      findAccessibleOne: findAccessibleOneStub,
    } as unknown as DbClusterRepository
    const notificationService = {
      createNotification: createNotificationStub,
    } as unknown as NotificationService
    const dbClusterService = new DbClusterService(
      em,
      dbClusterRepo,
      userContext,
      notificationService,
    )
    const userClient = {
      dbClusterDescribe: dbClusterDescribeStub,
    } as unknown as PlatformClient
    const adminClient = {} as unknown as PlatformClient
    const userService = {
      getUserById: getUserByIdStub,
    } as unknown as UserService
    const spaceService = {} as unknown as SpaceService
    const usersDbClustersSaltService = {} as unknown as UsersDbClustersSaltService
    const mainJobProducer = {} as unknown as MainQueueJobProducer
    return new DbClusterSynchronizeFacade(
      em,
      dbClusterService,
      userService,
      userContext,
      userClient,
      adminClient,
      spaceService,
      usersDbClustersSaltService,
      mainJobProducer,
      notificationService,
    )
  }
})
