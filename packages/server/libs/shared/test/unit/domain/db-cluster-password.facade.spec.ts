import { EntityManager } from '@mikro-orm/mysql'
import { DbClusterAccessControlEncryptor } from '@shared/domain/db-cluster/access-control/db-cluster-access-control-encryptor'
import { UsersDbClustersSaltService } from '@shared/domain/db-cluster/access-control/users-db-clusters-salt.service'
import { STATUS } from '@shared/domain/db-cluster/db-cluster.enum'
import { DbClusterRepository } from '@shared/domain/db-cluster/db-cluster.repository'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Uid } from '@shared/domain/entity/domain/uid'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { InvalidStateError, NotFoundError } from '@shared/errors'
import { DbClusterPasswordFacade } from 'apps/api/src/facade/db-cluster/password-facade/db-cluster-password.facade'
import { DbClusterSynchronizeFacade } from 'apps/api/src/facade/db-cluster/synchronize-facade/db-cluster-synchronize.facade'
import { expect } from 'chai'
import { stub, SinonStub } from 'sinon'

describe('DbClusterPasswordFacade', () => {
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

  let createPasswordRotatedEventStub: SinonStub
  let dbClusterService: DbClusterService
  const transactionalStub = stub()
  const em = {
    transactional: transactionalStub,
  } as unknown as EntityManager

  const createDbClusterSyncTaskStub = stub()
  const findAccessibleOneStub = stub()
  const syncDbClusterStub = stub()
  const getUsersDbClustersSaltByDbClusterAndUserStub = stub()

  beforeEach(async () => {
    const dbClusterRepo = {
      findAccessibleOne: findAccessibleOneStub,
    } as unknown as DbClusterRepository
    const notificationService = {} as unknown as NotificationService
    dbClusterService = new DbClusterService(em, dbClusterRepo, userContext, notificationService)
    createPasswordRotatedEventStub = stub(dbClusterService, 'createPasswordRotatedEvent')

    syncDbClusterStub.reset()
    syncDbClusterStub.throws()
    createDbClusterSyncTaskStub.reset()
    createDbClusterSyncTaskStub.throws()
    findAccessibleOneStub.reset()
    findAccessibleOneStub.throws()
    getUsersDbClustersSaltByDbClusterAndUserStub.reset()
    getUsersDbClustersSaltByDbClusterAndUserStub.throws()

    createPasswordRotatedEventStub.reset()
    createPasswordRotatedEventStub.throws()

    loadEntity.reset()
    loadEntity.throws()
  })

  afterEach(() => {
    createPasswordRotatedEventStub.restore()
  })

  describe('getPassword()', async () => {
    it('gets password for private db cluster', async () => {
      const dbCluster = {
        id: 1,
        dxid: 'dbcluster-xxx' as DxId<'dbcluster'>,
        uid: 'dbcluster-xxx-1' as Uid<'dbcluster'>,
        name: 'db-cluster-1',
        project: 'project-xxx',
        status: STATUS.STOPPED,
        scope: 'private',
      }
      loadEntity.resolves(USER)

      findAccessibleOneStub.withArgs({ uid: dbCluster.uid }).resolves(dbCluster)
      getUsersDbClustersSaltByDbClusterAndUserStub
        .withArgs(dbCluster.id, USER_ID)
        .resolves({ salt: '123abc' })

      const psw = await getInstance().getPassword(dbCluster.uid)

      expect(psw).to.be.a('string')
      expect(psw).to.equal(
        DbClusterAccessControlEncryptor.generatePassword(userContext.dxuser, '123abc'),
      )
    })

    it('throws PermissionError when user is not owner of the private db cluster', async () => {
      const dbCluster = {
        id: 1,
        dxid: 'dbcluster-xxx' as DxId<'dbcluster'>,
        uid: 'dbcluster-xxx-1' as Uid<'dbcluster'>,
        name: 'db-cluster-1',
        project: 'project-xxx',
        status: STATUS.STOPPED,
        scope: 'private',
      }
      loadEntity.resolves(USER)

      findAccessibleOneStub.withArgs({ uid: dbCluster.uid }).resolves(null)

      await expect(getInstance().getPassword(dbCluster.uid)).to.be.rejectedWith(
        NotFoundError,
        `DbCluster not found or not accessible`,
      )
    })

    it('throws InvalidStateError for terminated db cluster', async () => {
      const dbCluster = {
        id: 1,
        dxid: 'dbcluster-xxx' as DxId<'dbcluster'>,
        uid: 'dbcluster-xxx-1' as Uid<'dbcluster'>,
        name: 'db-cluster-1',
        project: 'project-xxx',
        status: STATUS.TERMINATED,
        scope: 'private',
      }
      loadEntity.resolves(USER)

      findAccessibleOneStub.withArgs({ uid: dbCluster.uid }).resolves(dbCluster)

      await expect(getInstance().getPassword(dbCluster.uid)).to.be.rejectedWith(
        InvalidStateError,
        `DbCluster is terminated.`,
      )
    })

    it('gets password for space db cluster', async () => {
      const dbCluster = {
        id: 1,
        dxid: 'dbcluster-xxx' as DxId<'dbcluster'>,
        uid: 'dbcluster-xxx-1' as Uid<'dbcluster'>,
        name: 'db-cluster-1',
        project: 'project-xxx',
        status: STATUS.STOPPED,
        scope: 'space-1',
      }
      loadEntity.resolves(USER)

      findAccessibleOneStub.withArgs({ uid: dbCluster.uid }).resolves(dbCluster)
      getUsersDbClustersSaltByDbClusterAndUserStub
        .withArgs(dbCluster.id, USER_ID)
        .resolves({ salt: '123abc' })

      const psw = await getInstance().getPassword(dbCluster.uid)

      expect(psw).to.be.a('string')
      expect(psw).to.equal(
        DbClusterAccessControlEncryptor.generatePassword(userContext.dxuser, '123abc'),
      )
    })

    it('throws NotFoundError when user is not member of space', async () => {
      const dbCluster = {
        id: 1,
        dxid: 'dbcluster-xxx' as DxId<'dbcluster'>,
        uid: 'dbcluster-xxx-1' as Uid<'dbcluster'>,
        name: 'db-cluster-1',
        project: 'project-xxx',
        status: STATUS.STOPPED,
        scope: 'space-1',
      }
      loadEntity.resolves(USER)

      findAccessibleOneStub.withArgs({ uid: dbCluster.uid }).resolves(null)

      await expect(getInstance().getPassword(dbCluster.uid)).to.be.rejectedWith(
        NotFoundError,
        `DbCluster not found or not accessible`,
      )
    })

    it('throws NotFoundError when no record for salt', async () => {
      const dbCluster = {
        id: 1,
        dxid: 'dbcluster-xxx' as DxId<'dbcluster'>,
        uid: 'dbcluster-xxx-1' as Uid<'dbcluster'>,
        name: 'db-cluster-1',
        project: 'project-xxx',
        status: STATUS.STOPPED,
        scope: 'space-1',
      }
      loadEntity.resolves(USER)

      findAccessibleOneStub.withArgs({ uid: dbCluster.uid }).resolves(dbCluster)
      getUsersDbClustersSaltByDbClusterAndUserStub.withArgs(dbCluster.id, USER_ID).resolves(null)

      await expect(getInstance().getPassword(dbCluster.uid)).to.be.rejectedWith(
        NotFoundError,
        `Error getting password.`,
      )
    })
  })

  describe('rotatePassword()', async () => {
    it('rotates password for private db cluster', async () => {
      const dbCluster = {
        id: 1,
        dxid: 'dbcluster-xxx' as DxId<'dbcluster'>,
        uid: 'dbcluster-xxx-1' as Uid<'dbcluster'>,
        name: 'db-cluster-1',
        project: 'project-xxx',
        status: STATUS.AVAILABLE,
        scope: 'private',
      }
      loadEntity.resolves(USER)

      findAccessibleOneStub.withArgs({ uid: dbCluster.uid }).resolves(dbCluster)
      getUsersDbClustersSaltByDbClusterAndUserStub
        .withArgs(dbCluster.id, USER_ID)
        .resolves({ salt: '123abc' })
      syncDbClusterStub.withArgs(dbCluster, USER).resolves({})
      transactionalStub.callsFake(async (fn) => {
        return fn(em)
      })

      createPasswordRotatedEventStub.withArgs(USER, dbCluster).resolves({})

      const psw = await getInstance().rotatePassword(dbCluster.uid)

      expect(psw).to.be.a('string')
      expect(psw).to.not.equal(
        DbClusterAccessControlEncryptor.generatePassword(userContext.dxuser, '123abc'),
      )
      expect(syncDbClusterStub.callCount).to.equal(1)
      expect(createPasswordRotatedEventStub.callCount).to.equal(1)
    })

    it('throws PermissionError when user is not owner of the private db cluster', async () => {
      const dbCluster = {
        id: 1,
        dxid: 'dbcluster-xxx' as DxId<'dbcluster'>,
        uid: 'dbcluster-xxx-1' as Uid<'dbcluster'>,
        name: 'db-cluster-1',
        project: 'project-xxx',
        status: STATUS.AVAILABLE,
        scope: 'private',
      }
      loadEntity.resolves(USER)
      findAccessibleOneStub.withArgs({ uid: dbCluster.uid }).resolves(null)

      await expect(getInstance().rotatePassword(dbCluster.uid)).to.be.rejectedWith(
        NotFoundError,
        `DbCluster not found or not accessible`,
      )
      expect(syncDbClusterStub.callCount).to.equal(0)
      expect(createPasswordRotatedEventStub.callCount).to.equal(0)
    })

    it('throws InvalidStateError for terminated db cluster', async () => {
      const dbCluster = {
        id: 1,
        dxid: 'dbcluster-xxx' as DxId<'dbcluster'>,
        uid: 'dbcluster-xxx-1' as Uid<'dbcluster'>,
        name: 'db-cluster-1',
        project: 'project-xxx',
        status: STATUS.TERMINATED,
        scope: 'private',
      }
      loadEntity.resolves(USER)
      findAccessibleOneStub.withArgs({ uid: dbCluster.uid }).resolves(dbCluster)

      await expect(getInstance().rotatePassword(dbCluster.uid)).to.be.rejectedWith(
        InvalidStateError,
        `DbCluster is terminated.`,
      )
      expect(syncDbClusterStub.callCount).to.equal(0)
      expect(createPasswordRotatedEventStub.callCount).to.equal(0)
    })

    it('rotates password for space db cluster', async () => {
      const dbCluster = {
        id: 1,
        dxid: 'dbcluster-xxx' as DxId<'dbcluster'>,
        uid: 'dbcluster-xxx-1' as Uid<'dbcluster'>,
        name: 'db-cluster-1',
        project: 'project-xxx',
        status: STATUS.STOPPED,
        scope: 'space-1',
      }
      loadEntity.resolves(USER)

      findAccessibleOneStub.withArgs({ uid: dbCluster.uid }).resolves(dbCluster)
      getUsersDbClustersSaltByDbClusterAndUserStub
        .withArgs(dbCluster.id, USER_ID)
        .resolves({ salt: '123abc' })
      syncDbClusterStub.withArgs(dbCluster, USER).resolves({})
      transactionalStub.callsFake(async (fn) => {
        return fn(em)
      })

      createPasswordRotatedEventStub.withArgs(USER, dbCluster).resolves({})

      const psw = await getInstance().rotatePassword(dbCluster.uid)

      expect(psw).to.be.a('string')
      expect(psw).to.not.equal(
        DbClusterAccessControlEncryptor.generatePassword(userContext.dxuser, '123abc'),
      )
      expect(psw).to.not.be.undefined
      expect(syncDbClusterStub.callCount).to.equal(0)
      expect(createPasswordRotatedEventStub.callCount).to.equal(1)
    })

    it('throws NotFoundError when user is not member of space', async () => {
      const dbCluster = {
        id: 1,
        dxid: 'dbcluster-xxx' as DxId<'dbcluster'>,
        uid: 'dbcluster-xxx-1' as Uid<'dbcluster'>,
        name: 'db-cluster-1',
        project: 'project-xxx',
        status: STATUS.AVAILABLE,
        scope: 'private',
      }
      loadEntity.resolves(USER)
      findAccessibleOneStub.withArgs({ uid: dbCluster.uid }).resolves(null)

      await expect(getInstance().rotatePassword(dbCluster.uid)).to.be.rejectedWith(
        NotFoundError,
        `DbCluster not found or not accessible`,
      )
      expect(syncDbClusterStub.callCount).to.equal(0)
      expect(createPasswordRotatedEventStub.callCount).to.equal(0)
    })

    it('throws NotFoundError when no record for salt', async () => {
      const dbCluster = {
        id: 1,
        dxid: 'dbcluster-xxx' as DxId<'dbcluster'>,
        uid: 'dbcluster-xxx-1' as Uid<'dbcluster'>,
        name: 'db-cluster-1',
        project: 'project-xxx',
        status: STATUS.AVAILABLE,
        scope: 'private',
      }
      loadEntity.resolves(USER)

      findAccessibleOneStub.withArgs({ uid: dbCluster.uid }).resolves(dbCluster)
      getUsersDbClustersSaltByDbClusterAndUserStub.withArgs(dbCluster.id, USER_ID).resolves(null)

      await expect(getInstance().rotatePassword(dbCluster.uid)).to.be.rejectedWith(
        NotFoundError,
        `Error getting password.`,
      )
      expect(syncDbClusterStub.callCount).to.equal(0)
      expect(createPasswordRotatedEventStub.callCount).to.equal(0)
    })
  })

  function getInstance(): DbClusterPasswordFacade {
    const usersDbClustersSaltService = {
      getUsersDbClustersSaltByDbClusterAndUser: getUsersDbClustersSaltByDbClusterAndUserStub,
    } as unknown as UsersDbClustersSaltService
    const dbClusterSynchronizeFacade = {
      syncDbCluster: syncDbClusterStub,
    } as unknown as DbClusterSynchronizeFacade
    return new DbClusterPasswordFacade(
      dbClusterService,
      em,
      userContext,
      usersDbClustersSaltService,
      dbClusterSynchronizeFacade,
    )
  }
})
