import { EntityManager } from '@mikro-orm/mysql'
import { STATUS } from '@shared/domain/db-cluster/db-cluster.enum'
import { DbClusterRepository } from '@shared/domain/db-cluster/db-cluster.repository'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { DbClusterStatusMismatchError, NotFoundError } from '@shared/errors'
import { PlatformClient } from '@shared/platform-client'
import { DbClusterActionFacade } from 'apps/api/src/facade/db-cluster/action-facade/db-cluster-action.facade'
import { expect } from 'chai'
import { stub } from 'sinon'

describe('DbClusterActionFacade', () => {
  const USER_ID = 0
  const USER = {
    id: USER_ID,
  }

  const loadEntity = stub()
  const userContext: UserContext = {
    ...USER,
    accessToken: 'accessToken',
    dxuser: 'dxuser',
    loadEntity,
  }

  const flushStub = stub() // resolves a Promise (async)
  const userDbClusterActionStub = stub()
  const adminDbClusterActionStub = stub()
  const dbClusterDescribeStub = stub()
  const persistDbClusterStub = stub()
  const getEditableByIdStub = stub()
  const findEditableOneStub = stub()
  const getSpaceId = stub()

  beforeEach(async () => {
    userDbClusterActionStub.reset()
    userDbClusterActionStub.throws()

    adminDbClusterActionStub.reset()
    adminDbClusterActionStub.throws()

    dbClusterDescribeStub.reset()
    dbClusterDescribeStub.throws()

    persistDbClusterStub.reset()
    persistDbClusterStub.throws()

    getEditableByIdStub.reset()
    getEditableByIdStub.throws()

    findEditableOneStub.reset()
    findEditableOneStub.throws()

    flushStub.reset()
    flushStub.throws()
    flushStub.resolves({})

    loadEntity.reset()
    loadEntity.throws()
    loadEntity.resolves(USER)

    getSpaceId.reset()
    getSpaceId.throws()
  })

  describe('startDbCluster()', async () => {
    it('should successfully start a stopped private dbCluster', async () => {
      const dbCluster = {
        dxid: 'dbcluster-xxx' as DxId<'dbcluster'>,
        name: 'db-cluster-1',
        project: 'project-xxx',
        status: STATUS.STOPPED,
        scope: 'private',
      }

      findEditableOneStub.withArgs({ dxid: dbCluster.dxid }).resolves(dbCluster)
      userDbClusterActionStub
        .withArgs({ dxid: dbCluster.dxid }, 'start')
        .resolves({ id: dbCluster.dxid })
      dbClusterDescribeStub
        .withArgs({ dxid: dbCluster.dxid, project: dbCluster.project })
        .resolves({ id: dbCluster.dxid, status: 'starting' })

      const res = await getInstance().startDbCluster(dbCluster.dxid)

      expect(loadEntity.notCalled).to.be.true()
      expect(flushStub.calledOnce).to.be.true()
      expect(res.name).eq('db-cluster-1')
      expect(res.dxid).eq(dbCluster.dxid)
      expect(res.status).eq(STATUS.STARTING)
    })

    it('should successfully start a stopped space dbCluster', async () => {
      const dbCluster = {
        dxid: 'dbcluster-xxx' as DxId<'dbcluster'>,
        name: 'db-cluster-1',
        project: 'project-xxx',
        status: STATUS.STOPPED,
        scope: 'space-1',
        getSpaceId,
      }

      findEditableOneStub.withArgs({ dxid: dbCluster.dxid }).resolves(dbCluster)
      getSpaceId.returns(1)
      getEditableByIdStub.withArgs(1).resolves({ type: SPACE_TYPE.GROUPS })
      adminDbClusterActionStub
        .withArgs({ dxid: dbCluster.dxid }, 'start')
        .resolves({ id: dbCluster.dxid })
      dbClusterDescribeStub
        .withArgs({ dxid: dbCluster.dxid, project: dbCluster.project })
        .resolves({ id: dbCluster.dxid, status: 'starting' })

      const res = await getInstance().startDbCluster(dbCluster.dxid)

      expect(loadEntity.notCalled).to.be.true()
      expect(flushStub.calledOnce).to.be.true()
      expect(res.name).eq('db-cluster-1')
      expect(res.dxid).eq(dbCluster.dxid)
      expect(res.status).eq(STATUS.STARTING)
    })

    it('should throw NotFoundError when dbCluster does not exist', async () => {
      findEditableOneStub.withArgs({ dxid: 'dbcluster-123' }).resolves(null)
      await expect(getInstance().startDbCluster('dbcluster-123')).to.be.rejectedWith(
        NotFoundError,
        `DbCluster not found or not accessible`,
      )
    })

    it('should throw StatusMismatchError when dbCluster is not stopped', async () => {
      const dbCluster = {
        dxid: 'dbcluster-xxx' as DxId<'dbcluster'>,
        name: 'db-cluster-1',
        project: 'project-xxx',
        status: STATUS.AVAILABLE,
        scope: 'private',
        uid: 'dbcluster-xxx-1',
      }

      findEditableOneStub.withArgs({ dxid: dbCluster.dxid }).resolves(dbCluster)
      await expect(getInstance().startDbCluster(dbCluster.dxid)).to.be.rejectedWith(
        DbClusterStatusMismatchError,
        `Start action can only be called when the DbCluster is in the "stopped" status.`,
      )
    })

    it('should throw NotFoundError when user is not member of space', async () => {
      const dbCluster = {
        dxid: 'dbcluster-xxx' as DxId<'dbcluster'>,
        name: 'db-cluster-1',
        project: 'project-xxx',
        status: STATUS.STOPPED,
        scope: 'space-2',
        getSpaceId,
      }

      findEditableOneStub.withArgs({ dxid: dbCluster.dxid }).resolves(null)
      await expect(getInstance().startDbCluster(dbCluster.dxid)).to.be.rejectedWith(
        NotFoundError,
        `DbCluster not found or not accessible`,
      )
    })

    it('should handle platform client errors', async () => {
      const dbCluster = {
        dxid: 'dbcluster-xxx' as DxId<'dbcluster'>,
        name: 'db-cluster-1',
        project: 'project-xxx',
        status: STATUS.STOPPED,
        scope: 'private',
      }

      findEditableOneStub.withArgs({ dxid: dbCluster.dxid }).resolves(dbCluster)
      userDbClusterActionStub
        .withArgs({ dxid: dbCluster.dxid }, 'start')
        .throws(new Error('Platform Error'))

      await expect(getInstance().startDbCluster(dbCluster.dxid)).to.be.rejectedWith(
        Error,
        `Platform Error`,
      )
      expect(loadEntity.notCalled).to.be.true()
    })
  })

  describe('stopDbCluster()', async () => {
    it('should successfully stop an available private dbCluster', async () => {
      const dbCluster = {
        dxid: 'dbcluster-xxx' as DxId<'dbcluster'>,
        name: 'db-cluster-1',
        project: 'project-xxx',
        status: STATUS.AVAILABLE,
        scope: 'private',
      }

      findEditableOneStub.withArgs({ dxid: dbCluster.dxid }).resolves(dbCluster)
      userDbClusterActionStub
        .withArgs({ dxid: dbCluster.dxid }, 'stop')
        .resolves({ id: dbCluster.dxid })
      dbClusterDescribeStub
        .withArgs({ dxid: dbCluster.dxid, project: dbCluster.project })
        .resolves({ id: dbCluster.dxid, status: 'stopping' })

      const res = await getInstance().stopDbCluster(dbCluster.dxid)

      expect(loadEntity.notCalled).to.be.true()
      expect(flushStub.calledOnce).to.be.true()
      expect(res.name).eq('db-cluster-1')
      expect(res.dxid).eq(dbCluster.dxid)
      expect(res.status).eq(STATUS.STOPPING)
    })

    it('should successfully stop an available space dbCluster', async () => {
      const dbCluster = {
        dxid: 'dbcluster-xxx' as DxId<'dbcluster'>,
        name: 'db-cluster-1',
        project: 'project-xxx',
        status: STATUS.AVAILABLE,
        scope: 'space-1',
        getSpaceId,
      }

      findEditableOneStub.withArgs({ dxid: dbCluster.dxid }).resolves(dbCluster)
      getSpaceId.returns(1)
      getEditableByIdStub.withArgs(1).resolves({ type: SPACE_TYPE.GROUPS })
      adminDbClusterActionStub
        .withArgs({ dxid: dbCluster.dxid }, 'stop')
        .resolves({ id: dbCluster.dxid })
      dbClusterDescribeStub
        .withArgs({ dxid: dbCluster.dxid, project: dbCluster.project })
        .resolves({ id: dbCluster.dxid, status: 'stopping' })

      const res = await getInstance().stopDbCluster(dbCluster.dxid)

      expect(loadEntity.notCalled).to.be.true()
      expect(flushStub.calledOnce).to.be.true()
      expect(res.name).eq('db-cluster-1')
      expect(res.dxid).eq(dbCluster.dxid)
      expect(res.status).eq(STATUS.STOPPING)
    })

    it('should throw NotFoundError when dbCluster does not exist', async () => {
      findEditableOneStub.withArgs({ dxid: 'dbcluster-123' }).resolves(null)
      await expect(getInstance().stopDbCluster('dbcluster-123')).to.be.rejectedWith(
        NotFoundError,
        `DbCluster not found or not accessible`,
      )
    })

    it('should throw StatusMismatchError when dbCluster is not available', async () => {
      const dbCluster = {
        dxid: 'dbcluster-xxx' as DxId<'dbcluster'>,
        name: 'db-cluster-1',
        project: 'project-xxx',
        status: STATUS.STOPPED,
        scope: 'private',
        uid: 'dbcluster-xxx-1',
      }

      findEditableOneStub.withArgs({ dxid: dbCluster.dxid }).resolves(dbCluster)
      await expect(getInstance().stopDbCluster(dbCluster.dxid)).to.be.rejectedWith(
        DbClusterStatusMismatchError,
        `Stop action can only be called when the DbCluster is in the "available" status.`,
      )
    })

    it('should throw NotFoundError when user is not member of space', async () => {
      const dbCluster = {
        dxid: 'dbcluster-xxx' as DxId<'dbcluster'>,
        name: 'db-cluster-1',
        project: 'project-xxx',
        status: STATUS.AVAILABLE,
        scope: 'space-2',
        getSpaceId,
      }

      findEditableOneStub.withArgs({ dxid: dbCluster.dxid }).resolves(null)
      await expect(getInstance().stopDbCluster(dbCluster.dxid)).to.be.rejectedWith(
        NotFoundError,
        `DbCluster not found or not accessible`,
      )
    })

    it('should handle platform client errors', async () => {
      const dbCluster = {
        dxid: 'dbcluster-xxx' as DxId<'dbcluster'>,
        name: 'db-cluster-1',
        project: 'project-xxx',
        status: STATUS.AVAILABLE,
        scope: 'private',
      }

      findEditableOneStub.withArgs({ dxid: dbCluster.dxid }).resolves(dbCluster)
      userDbClusterActionStub
        .withArgs({ dxid: dbCluster.dxid }, 'stop')
        .throws(new Error('Platform Error'))

      await expect(getInstance().stopDbCluster(dbCluster.dxid)).to.be.rejectedWith(
        Error,
        `Platform Error`,
      )
      expect(loadEntity.notCalled).to.be.true()
    })
  })

  describe('terminateDbCluster()', async () => {
    it('should successfully terminate an available private dbCluster', async () => {
      const dbCluster = {
        dxid: 'dbcluster-xxx' as DxId<'dbcluster'>,
        name: 'db-cluster-1',
        project: 'project-xxx',
        status: STATUS.AVAILABLE,
        scope: 'private',
      }

      findEditableOneStub.withArgs({ dxid: dbCluster.dxid }).resolves(dbCluster)
      userDbClusterActionStub
        .withArgs({ dxid: dbCluster.dxid }, 'terminate')
        .resolves({ id: dbCluster.dxid })
      dbClusterDescribeStub
        .withArgs({ dxid: dbCluster.dxid, project: dbCluster.project })
        .resolves({ id: dbCluster.dxid, status: 'terminating' })

      const res = await getInstance().terminateDbCluster(dbCluster.dxid)

      expect(loadEntity.notCalled).to.be.true()
      expect(flushStub.calledOnce).to.be.true()
      expect(res.name).eq('db-cluster-1')
      expect(res.dxid).eq(dbCluster.dxid)
      expect(res.status).eq(STATUS.TERMINATING)
    })

    it('should successfully terminate an available space dbCluster', async () => {
      const dbCluster = {
        dxid: 'dbcluster-xxx' as DxId<'dbcluster'>,
        name: 'db-cluster-1',
        project: 'project-xxx',
        status: STATUS.AVAILABLE,
        scope: 'space-1',
        getSpaceId,
      }

      findEditableOneStub.withArgs({ dxid: dbCluster.dxid }).resolves(dbCluster)
      getSpaceId.returns(1)
      getEditableByIdStub.withArgs(1).resolves({ type: SPACE_TYPE.GROUPS })
      adminDbClusterActionStub
        .withArgs({ dxid: dbCluster.dxid }, 'terminate')
        .resolves({ id: dbCluster.dxid })
      dbClusterDescribeStub
        .withArgs({ dxid: dbCluster.dxid, project: dbCluster.project })
        .resolves({ id: dbCluster.dxid, status: 'terminating' })

      const res = await getInstance().terminateDbCluster(dbCluster.dxid)

      expect(loadEntity.notCalled).to.be.true()
      expect(flushStub.calledOnce).to.be.true()
      expect(res.name).eq('db-cluster-1')
      expect(res.dxid).eq(dbCluster.dxid)
      expect(res.status).eq(STATUS.TERMINATING)
    })

    it('should throw NotFoundError when dbCluster does not exist', async () => {
      findEditableOneStub.withArgs({ dxid: 'dbcluster-123' }).resolves(null)
      await expect(getInstance().terminateDbCluster('dbcluster-123')).to.be.rejectedWith(
        NotFoundError,
        `DbCluster not found or not accessible`,
      )
    })

    it('should throw StatusMismatchError when dbCluster is not available', async () => {
      const dbCluster = {
        dxid: 'dbcluster-xxx' as DxId<'dbcluster'>,
        name: 'db-cluster-1',
        project: 'project-xxx',
        status: STATUS.STOPPED,
        scope: 'private',
        uid: 'dbcluster-xxx-1',
      }

      findEditableOneStub.withArgs({ dxid: dbCluster.dxid }).resolves(dbCluster)
      await expect(getInstance().terminateDbCluster(dbCluster.dxid)).to.be.rejectedWith(
        DbClusterStatusMismatchError,
        `Terminate action can only be called when the DbCluster is in the "available" status.`,
      )
    })

    it('should throw NotFoundError when user is not member of space', async () => {
      const dbCluster = {
        dxid: 'dbcluster-xxx' as DxId<'dbcluster'>,
        name: 'db-cluster-1',
        project: 'project-xxx',
        status: STATUS.AVAILABLE,
        scope: 'space-2',
        getSpaceId,
      }

      findEditableOneStub.withArgs({ dxid: dbCluster.dxid }).resolves(null)
      await expect(getInstance().terminateDbCluster(dbCluster.dxid)).to.be.rejectedWith(
        NotFoundError,
        `DbCluster not found or not accessible`,
      )
    })

    it('should handle platform client errors', async () => {
      const dbCluster = {
        dxid: 'dbcluster-xxx' as DxId<'dbcluster'>,
        name: 'db-cluster-1',
        project: 'project-xxx',
        status: STATUS.AVAILABLE,
        scope: 'private',
      }

      findEditableOneStub.withArgs({ dxid: dbCluster.dxid }).resolves(dbCluster)
      userDbClusterActionStub
        .withArgs({ dxid: dbCluster.dxid }, 'terminate')
        .throws(new Error('Platform Error'))

      await expect(getInstance().terminateDbCluster(dbCluster.dxid)).to.be.rejectedWith(
        Error,
        `Platform Error`,
      )
      expect(loadEntity.notCalled).to.be.true()
    })
  })

  function getInstance(): DbClusterActionFacade {
    const em = {
      flush: flushStub,
    } as unknown as EntityManager
    const userClient = {
      dbClusterAction: userDbClusterActionStub,
      dbClusterDescribe: dbClusterDescribeStub,
    } as unknown as PlatformClient
    const adminClient = {
      dbClusterAction: adminDbClusterActionStub,
    } as unknown as PlatformClient
    const dbClusterRepo = {
      findEditableOne: findEditableOneStub,
    } as unknown as DbClusterRepository
    const notificationService = {} as unknown as NotificationService
    const dbClusterService = new DbClusterService(
      em,
      dbClusterRepo,
      userContext,
      notificationService,
    )
    const spaceService = {
      getEditableById: getEditableByIdStub,
    } as unknown as SpaceService
    return new DbClusterActionFacade(
      dbClusterService,
      em,
      userContext,
      userClient,
      adminClient,
      spaceService,
    )
  }
})
