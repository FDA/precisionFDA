import { EntityManager } from '@mikro-orm/mysql'
import { DbCluster } from '@shared/domain/db-cluster/db-cluster.entity'
import { DB_SYNC_STATUS, ENGINE, ENGINES, STATUS, STATUSES } from '@shared/domain/db-cluster/db-cluster.enum'
import { DbClusterRepository } from '@shared/domain/db-cluster/db-cluster.repository'
import { DbClusterCountService } from '@shared/domain/db-cluster/service/db-cluster-count.service'
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
import { DbClusterCountService } from '@shared/domain/db-cluster/service/db-cluster-count.service'
import { DbClusterPaginationDTO } from '@shared/domain/db-cluster/dto/db-cluster-pagination.dto'

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
  const paginateStub = stub()
  const paginateWithPropertySortStub = stub()

  const asDbClusterSort = (sort: Record<string, string>): DbClusterPaginationDTO['sort'] =>
    sort as unknown as DbClusterPaginationDTO['sort']

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
    paginateStub.reset()
    paginateStub.throws()
    paginateWithPropertySortStub.reset()
    paginateWithPropertySortStub.throws()
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

      const result = await getInstance().persistDbCluster(input, describeRes, USER as User, 'salt123')

      expect(result).to.not.equal(undefined)
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

      transactionalStub.callsFake(async callback => {
        return callback(transactionalEntityManager)
      })

      findOneOrFailStub.withArgs(DbCluster, { uid: dbCluster.uid }).resolves(dbCluster)
      persistAndFlushStub.withArgs(match({ ...dbCluster, syncStatus: DB_SYNC_STATUS.COMPLETED })).resolves()

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
        persistAndFlushStub.calledOnceWith(match({ ...dbCluster, syncStatus: DB_SYNC_STATUS.COMPLETED })),
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

      transactionalStub.callsFake(async callback => {
        return callback(transactionalEntityManager)
      })

      findOneOrFailStub.withArgs(DbCluster, { uid: dbCluster.uid }).resolves(dbCluster)
      persistAndFlushStub.withArgs(match({ ...dbCluster, syncStatus: DB_SYNC_STATUS.FAILED })).resolves()

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
        persistAndFlushStub.calledOnceWith(match({ ...dbCluster, syncStatus: DB_SYNC_STATUS.FAILED })),
      ).to.be.true()
    })
  })

  describe('#paginate', () => {
    const paginatedResult = {
      data: [],
      meta: { total: 0, totalPages: 1, pageSize: 10, page: 1 },
    }

    it('should delegate to paginateWithPropertySort when sort key is not an entity field', async () => {
      paginateWithPropertySortStub.resolves(paginatedResult)

      const pagination = {
        page: 1,
        pageSize: 10,
        scope: 'private' as const,
        sort: asDbClusterSort({ myCustomProperty: 'ASC' }),
      }
      const where = { scope: STATIC_SCOPE.PRIVATE }

      const result = await getInstance().paginate(pagination, where)

      expect(paginateWithPropertySortStub.calledOnce).to.be.true()
      const call = paginateWithPropertySortStub.getCall(0)
      expect(call.args[0]).to.equal('myCustomProperty')
      expect(call.args[1]).to.equal('ASC')
      expect(call.args[3]).to.equal(1) // page
      expect(call.args[4]).to.equal(10) // limit
      expect(call.args[5]).to.equal('properties') // propertiesRelation
      expect(call.args[6]).to.deep.equal(['user', 'properties', 'taggings.tag']) // populate
      expect(paginateStub.called).to.be.false()
      expect(result).to.equal(paginatedResult)
    })

    it('should pass DESC direction to paginateWithPropertySort', async () => {
      paginateWithPropertySortStub.resolves(paginatedResult)

      const pagination = {
        page: 2,
        pageSize: 25,
        scope: 'private' as const,
        sort: asDbClusterSort({ someProperty: 'desc' }),
      }
      const where = { scope: STATIC_SCOPE.PRIVATE }

      await getInstance().paginate(pagination, where)

      expect(paginateWithPropertySortStub.calledOnce).to.be.true()
      const call = paginateWithPropertySortStub.getCall(0)
      expect(call.args[0]).to.equal('someProperty')
      expect(call.args[1]).to.equal('DESC')
      expect(call.args[3]).to.equal(2) // page
      expect(call.args[4]).to.equal(25) // limit
      expect(call.args[5]).to.equal('properties') // propertiesRelation
      expect(call.args[6]).to.deep.equal(['user', 'properties', 'taggings.tag']) // populate
    })

    it('should fall back to regular paginate when sort key is a known entity field', async () => {
      paginateStub.resolves(paginatedResult)

      const pagination = {
        page: 1,
        pageSize: 10,
        scope: 'private' as const,
        sort: asDbClusterSort({ name: 'ASC' }),
      }
      const where = { scope: STATIC_SCOPE.PRIVATE }

      const result = await getInstance().paginate(pagination, where)

      expect(paginateStub.calledOnce).to.be.true()
      expect(paginateWithPropertySortStub.called).to.be.false()
      expect(result).to.equal(paginatedResult)
    })

    it('should fall back to regular paginate when sort is empty', async () => {
      paginateStub.resolves(paginatedResult)

      const pagination = {
        page: 1,
        pageSize: 10,
        scope: 'private' as const,
        sort: {},
      }
      const where = { scope: STATIC_SCOPE.PRIVATE }

      const result = await getInstance().paginate(pagination, where)

      expect(paginateStub.calledOnce).to.be.true()
      expect(paginateWithPropertySortStub.called).to.be.false()
      expect(result).to.equal(paginatedResult)
    })

    it('should fall back to regular paginate when sort is undefined', async () => {
      paginateStub.resolves(paginatedResult)

      const pagination = {
        page: 1,
        pageSize: 10,
        scope: 'private' as const,
      }
      const where = { scope: STATIC_SCOPE.PRIVATE }

      const result = await getInstance().paginate(pagination, where)

      expect(paginateStub.calledOnce).to.be.true()
      expect(paginateWithPropertySortStub.called).to.be.false()
      expect(result).to.equal(paginatedResult)
    })

    it('should use default page=1 and pageSize=10 when not provided', async () => {
      paginateWithPropertySortStub.resolves(paginatedResult)

      const pagination = {
        scope: 'private' as const,
        sort: asDbClusterSort({ customProp: 'ASC' }),
      }
      const where = { scope: STATIC_SCOPE.PRIVATE }

      await getInstance().paginate(pagination, where)

      expect(paginateWithPropertySortStub.calledOnce).to.be.true()
      const call = paginateWithPropertySortStub.getCall(0)
      expect(call.args[3]).to.equal(1) // default page
      expect(call.args[4]).to.equal(10) // default pageSize
    })

    it('should treat all known entity fields as non-property sorts', async () => {
      const entityFields = [
        'id',
        'createdAt',
        'updatedAt',
        'scope',
        'dxid',
        'uid',
        'name',
        'project',
        'dxInstanceClass',
        'engineVersion',
        'host',
        'port',
        'description',
        'statusAsOf',
        'salt',
        'status',
        'syncStatus',
        'engine',
        'failureReason',
      ]

      for (const field of entityFields) {
        paginateStub.reset()
        paginateStub.resolves(paginatedResult)
        paginateWithPropertySortStub.reset()
        paginateWithPropertySortStub.resolves(paginatedResult)

        const pagination = {
          page: 1,
          pageSize: 10,
          scope: 'private' as const,
          sort: asDbClusterSort({ [field]: 'ASC' }),
        }
        const where = { scope: STATIC_SCOPE.PRIVATE }

        await getInstance().paginate(pagination, where)

        expect(paginateStub.calledOnce, `Expected regular paginate for entity field "${field}"`).to.be.true()
        expect(
          paginateWithPropertySortStub.called,
          `Expected no property sort for entity field "${field}"`,
        ).to.be.false()
      }
    })

    it('should default to DESC when direction is not ASC', async () => {
      paginateWithPropertySortStub.resolves(paginatedResult)

      const pagination = {
        page: 1,
        pageSize: 10,
        scope: 'private' as const,
        sort: asDbClusterSort({ myProp: 'invalid' }),
      }
      const where = { scope: STATIC_SCOPE.PRIVATE }

      await getInstance().paginate(pagination, where)

      expect(paginateWithPropertySortStub.calledOnce).to.be.true()
      const call = paginateWithPropertySortStub.getCall(0)
      expect(call.args[1]).to.equal('DESC')
    })
  })

  function getInstance(): DbClusterService {
    const em = {
      persistAndFlush: persistAndFlushStub,
      transactional: transactionalStub,
    } as unknown as EntityManager
    const dbClusterRepo = {
      create: createStub,
      paginate: paginateStub,
      paginateWithPropertySort: paginateWithPropertySortStub,
    } as unknown as DbClusterRepository
    const notificationService = {
      createNotification: createNotificationStub,
    } as unknown as NotificationService
    const dbClusterCountService = {
      count: stub().resolves(0),
    } as unknown as DbClusterCountService

    return new DbClusterService(em, dbClusterRepo, userContext, notificationService, dbClusterCountService)
  }
})
