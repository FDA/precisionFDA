import { EntityManager } from '@mikro-orm/mysql'
import { DbCluster } from '@shared/domain/db-cluster/db-cluster.entity'
import {
  DB_SYNC_STATUS,
  ENGINE,
  ENGINES,
  STATUS,
  STATUSES,
} from '@shared/domain/db-cluster/db-cluster.enum'
import { DbClusterRepository } from '@shared/domain/db-cluster/db-cluster.repository'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Uid } from '@shared/domain/entity/domain/uid'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { User } from '@shared/domain/user/user.entity'
import { NOTIFICATION_ACTION, STATIC_SCOPE } from '@shared/enums'
import { expect } from 'chai'
import { invertObj } from 'ramda'
import { match, stub } from 'sinon'

describe('DbClusterService', () => {
  const USER_ID = 1
  const USER = {
    id: USER_ID,
    privateFilesProject: 'project-xxx',
    fullName: 'John Doe',
    dxuser: 'john_doe',
  }

  const loadEntity = stub()
  const userContext: UserContext = {
    ...USER,
    accessToken: 'accessToken',
    dxuser: 'dxuser',
    loadEntity,
  }

  const createStub = stub()
  const persistAndFlushStub = stub()
  const transactionalStub = stub()
  const findOneOrFailStub = stub()
  const createNotificationStub = stub()

  beforeEach(async () => {
    createStub.reset()
    createStub.throws()
    persistAndFlushStub.reset()
    persistAndFlushStub.throws()
    findOneOrFailStub.reset()
    findOneOrFailStub.throws()
    transactionalStub.reset()
    transactionalStub.throws()
    createNotificationStub.reset()
    createNotificationStub.throws()
  })

  describe('#persistDbCluster', () => {
    it('should persists DbCluster', async () => {
      const input = {
        name: 'db-cluster-1',
        engine: 'aurora-postgresql',
        engineVersion: '14.6',
        dxInstanceClass: 'db_std1_x2',
        scope: STATIC_SCOPE.PRIVATE,
        description: 'description',
      }
      const describeRes = {
        id: 'dbcluster-xxx' as DxId<'dbcluster'>,
        project: 'project-xxx',
        name: 'db-cluster-1',
        created: 1111111,
        modified: 11111112,
        createdBy: { user: USER.dxuser },
        dxInstanceClass: 'db_std1_x2',
        engine: 'aurora-postgresql',
        engineVersion: '14.6',
        status: 'creating',
        endpoint: 'db-cluster.com',
        port: '5432',
      }
      const dbCluster = {
        dxid: 'dbcluster-xxx' as DxId<'dbcluster'>,
        name: 'db-cluster-1',
        project: 'project-xxx',
        status: 'creating',
        scope: 'private',
        uid: 'dbcluster-xxx-1' as Uid<'dbcluster'>,
      }
      createStub
        .withArgs(
          match({
            user: USER,
            dxid: describeRes.id,
            uid: `${describeRes.id}-1`,
            name: describeRes.name,
            status: STATUS[invertObj(STATUSES)[describeRes.status]],
            syncStatus: DB_SYNC_STATUS.IN_PROGRESS,
            project: describeRes.project,
            dxInstanceClass: describeRes.dxInstanceClass,
            engine: ENGINE[invertObj(ENGINES)[describeRes.engine]],
            engineVersion: describeRes.engineVersion,
            host: describeRes.endpoint,
            port: describeRes.port,
            scope: input.scope,
            description: input.description,
            salt: 'salt123',
          }),
        )
        .returns(dbCluster)

      persistAndFlushStub.withArgs(dbCluster).resolves({})

      const result = await getInstance().persistDbCluster(
        input,
        describeRes,
        USER as User,
        'salt123',
      )

      expect(result).to.exist
      expect(result.name).to.equal('db-cluster-1')
      expect(result.scope).to.equal(STATIC_SCOPE.PRIVATE)
      expect(result.status).to.equal('creating')
      expect(result.dxid).to.equal('dbcluster-xxx')
      expect(result.uid).to.equal('dbcluster-xxx-1')
    })
  })

  describe('#updateSyncStatus', () => {
    it('should update sync status to COMPLETED', async () => {
      const dbCluster = {
        dxid: 'dbcluster-xxx' as DxId<'dbcluster'>,
        name: 'db-cluster-1',
        project: 'project-xxx',
        status: 'creating',
        scope: 'private',
        uid: 'dbcluster-xxx-1' as Uid<'dbcluster'>,
        syncStatus: DB_SYNC_STATUS.IN_PROGRESS,
      }

      const transactionalEntityManager = {
        findOneOrFail: findOneOrFailStub,
        persistAndFlush: persistAndFlushStub,
      } as unknown as EntityManager

      transactionalStub.callsFake(async (callback) => {
        return callback(transactionalEntityManager)
      })

      findOneOrFailStub.withArgs(DbCluster, { uid: dbCluster.uid }).resolves(dbCluster)
      persistAndFlushStub
        .withArgs(match({ ...dbCluster, syncStatus: DB_SYNC_STATUS.COMPLETED }))
        .resolves()

      createNotificationStub
        .withArgs(
          match({
            action: NOTIFICATION_ACTION.DB_CLUSTER_UPDATED,
            userId: userContext.id,
          }),
        )
        .resolves({})

      await getInstance().updateSyncStatus(dbCluster.uid, DB_SYNC_STATUS.COMPLETED)

      expect(transactionalStub.calledOnce).to.be.true()
      expect(findOneOrFailStub.calledOnceWith(DbCluster, { uid: dbCluster.uid })).to.be.true()
      expect(
        persistAndFlushStub.calledOnceWith(
          match({ ...dbCluster, syncStatus: DB_SYNC_STATUS.COMPLETED }),
        ),
      ).to.be.true()
    })

    it('should update sync status to FAILED', async () => {
      const dbCluster = {
        dxid: 'dbcluster-xxx' as DxId<'dbcluster'>,
        name: 'db-cluster-1',
        project: 'project-xxx',
        status: 'creating',
        scope: 'private',
        uid: 'dbcluster-xxx-1' as Uid<'dbcluster'>,
        syncStatus: DB_SYNC_STATUS.IN_PROGRESS,
      }

      const transactionalEntityManager = {
        findOneOrFail: findOneOrFailStub,
        persistAndFlush: persistAndFlushStub,
      } as unknown as EntityManager

      transactionalStub.callsFake(async (callback) => {
        return callback(transactionalEntityManager)
      })

      findOneOrFailStub.withArgs(DbCluster, { uid: dbCluster.uid }).resolves(dbCluster)
      persistAndFlushStub
        .withArgs(match({ ...dbCluster, syncStatus: DB_SYNC_STATUS.FAILED }))
        .resolves()

      createNotificationStub
        .withArgs(
          match({
            action: NOTIFICATION_ACTION.DB_CLUSTER_UPDATED,
            userId: userContext.id,
          }),
        )
        .resolves({})

      await getInstance().updateSyncStatus(dbCluster.uid, DB_SYNC_STATUS.FAILED)

      expect(transactionalStub.calledOnce).to.be.true()
      expect(findOneOrFailStub.calledOnceWith(DbCluster, { uid: dbCluster.uid })).to.be.true()
      expect(
        persistAndFlushStub.calledOnceWith(
          match({ ...dbCluster, syncStatus: DB_SYNC_STATUS.FAILED }),
        ),
      ).to.be.true()
    })
  })

  function getInstance(): DbClusterService {
    const em = {
      persistAndFlush: persistAndFlushStub,
      transactional: transactionalStub,
    } as unknown as EntityManager
    const dbClusterRepo = {
      create: createStub,
    } as unknown as DbClusterRepository
    const notificationService = {
      createNotification: createNotificationStub,
    } as unknown as NotificationService
    const dbClusterCountService = {
      count: stub().resolves(0),
    } as any

    return new DbClusterService(em, dbClusterRepo, userContext, notificationService, dbClusterCountService)
  }
})
