import { EntityManager } from '@mikro-orm/mysql'
import { ENGINES } from '@shared/domain/db-cluster/db-cluster.enum'
import { DbClusterRepository } from '@shared/domain/db-cluster/db-cluster.repository'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { STATIC_SCOPE } from '@shared/enums'
import { NotFoundError, PermissionError } from '@shared/errors'
import { PlatformClient } from '@shared/platform-client'
import { MainQueueJobProducer } from '@shared/queue/producer/main-queue-job.producer'
import { DbClusterCreateFacade } from 'apps/api/src/facade/db-cluster/create-facade/db-cluster-create.facade'
import { expect } from 'chai'
import { stub, match } from 'sinon'

describe('DbClusterCreateFacade', () => {
  const USER_ID = 1
  const USER = {
    id: USER_ID,
    privateFilesProject: 'project-xxx',
  }

  const loadEntity = stub()
  const userContext: UserContext = {
    ...USER,
    accessToken: 'accessToken',
    dxuser: 'dxuser',
    loadEntity,
  }
  const dbClusterCreateStub = stub()
  const dbClusterDescribeStub = stub()
  const createDbClusterSyncTaskStub = stub()
  const getEditableByIdStub = stub()
  const createStub = stub()
  const persistAndFlushStub = stub()

  const isHost = (): true => true
  const loadItems: () => [{ user: { id: number }; isHost: () => true }] = () => [
    { user: { id: 1 }, isHost },
  ]

  beforeEach(async () => {
    dbClusterCreateStub.reset()
    dbClusterCreateStub.throws()

    dbClusterDescribeStub.reset()
    dbClusterDescribeStub.throws()

    createDbClusterSyncTaskStub.reset()
    createDbClusterSyncTaskStub.throws()

    getEditableByIdStub.reset()
    getEditableByIdStub.throws()

    loadEntity.reset()
    loadEntity.throws()
    loadEntity.resolves(USER)

    createStub.reset()
    createStub.throws()

    persistAndFlushStub.reset()
    persistAndFlushStub.throws()
  })

  it('creates private db cluster', async () => {
    dbClusterCreateStub
      .withArgs({
        name: 'private-cluster-1',
        engine: ENGINES.POSTGRESQL,
        engineVersion: '14.6',
        dxInstanceClass: 'db_std1_x2',
        project: 'project-xxx',
        adminPassword: match.string,
      })
      .resolves({ id: 'dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82' })
    dbClusterDescribeStub
      .withArgs({ dxid: 'dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82', project: 'project-xxx' })
      .resolves({
        name: 'private-cluster-1',
        id: 'dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82',
        status: 'creating',
        project: 'project-xxx',
        dxInstanceClass: 'ins_1',
        engine: 'aurora-postgresql',
        engineVersion: '14.6',
        endpoint: 'dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82.aws.com',
        port: 5432,
        statusAsOf: '1.1.1999',
      })
    createStub.withArgs(match({ dxid: 'dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82' })).returns({
      id: 1,
      dxid: 'dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82',
      uid: 'dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82-1',
      name: 'private-cluster-1',
      scope: 'private',
      project: 'project-xxx',
    })

    persistAndFlushStub
      .withArgs(match({ id: 1, dxid: 'dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82' }))
      .resolves({})

    createDbClusterSyncTaskStub
      .withArgs({ dxid: 'dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82' }, userContext)
      .resolves({})

    const dbCluster = await getInstance().createDbCluster({
      name: 'private-cluster-1',
      scope: STATIC_SCOPE.PRIVATE,
      description: 'private-cluster-1 description',
      engine: ENGINES.POSTGRESQL,
      engineVersion: '14.6',
      dxInstanceClass: 'db_std1_x2',
    })

    expect(dbCluster.id).eq(1)
    expect(dbCluster.dxid).eq('dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82')
    expect(dbCluster.uid).eq('dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82-1')
    expect(dbCluster.name).eq('private-cluster-1')
    expect(dbCluster.scope).eq(STATIC_SCOPE.PRIVATE)
    expect(dbCluster.project).eq('project-xxx')
    expect(createDbClusterSyncTaskStub.calledOnce).to.be.true()
    expect(loadEntity.calledOnce).to.be.true()
  })

  it('creates space db cluster', async () => {
    getEditableByIdStub.withArgs(1).resolves({
      id: 1,
      type: SPACE_TYPE.GROUPS,
      hostProject: 'project-xxx',
      spaceMemberships: { loadItems },
    })
    dbClusterCreateStub
      .withArgs({
        name: 'space-cluster',
        engine: ENGINES.POSTGRESQL,
        engineVersion: '14.6',
        dxInstanceClass: 'db_std1_x2',
        project: 'project-xxx',
        adminPassword: match.string,
      })
      .resolves({ id: 'dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82' })
    dbClusterDescribeStub
      .withArgs({ dxid: 'dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82', project: 'project-xxx' })
      .resolves({
        name: 'space-cluster',
        id: 'dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82',
        status: 'creating',
        project: 'project-xxx',
        dxInstanceClass: 'ins_1',
        engine: 'aurora-postgresql',
        engineVersion: '14.6',
        endpoint: 'dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82.aws.com',
        port: 5432,
        statusAsOf: '1.1.1999',
      })

    createStub.withArgs(match({ dxid: 'dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82' })).returns({
      id: 1,
      dxid: 'dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82',
      uid: 'dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82-1',
      name: 'space-cluster',
      scope: 'space-1',
      project: 'project-xxx',
    })

    persistAndFlushStub
      .withArgs(match({ id: 1, dxid: 'dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82' }))
      .resolves({})

    createDbClusterSyncTaskStub
      .withArgs({ dxid: 'dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82' }, userContext)
      .resolves({})

    const dbCluster = await getInstance().createDbCluster({
      name: 'space-cluster',
      scope: 'space-1',
      engine: ENGINES.POSTGRESQL,
      engineVersion: '14.6',
      dxInstanceClass: 'db_std1_x2',
    })

    expect(dbCluster.id).eq(1)
    expect(dbCluster.dxid).eq('dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82')
    expect(dbCluster.uid).eq('dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82-1')
    expect(dbCluster.name).eq('space-cluster')
    expect(dbCluster.scope).eq('space-1')
    expect(dbCluster.project).eq('project-xxx')
    expect(createDbClusterSyncTaskStub.calledOnce).to.be.true()
    expect(loadEntity.calledOnce).to.be.true()
  })

  it('throws NotFoundError when project is null', async () => {
    getEditableByIdStub.resolves({
      id: 1,
      type: SPACE_TYPE.GROUPS,
      hostProject: null,
      spaceMemberships: { loadItems },
    })

    await expect(
      getInstance().createDbCluster({
        name: 'space-cluster',
        scope: 'space-1',
        engine: ENGINES.POSTGRESQL,
        engineVersion: '14.6',
        dxInstanceClass: 'db_std1_x2',
      }),
    ).to.be.rejectedWith(
      NotFoundError,
      `Couldn't get project to create DbCluster in selected context.`,
    )
    expect(dbClusterCreateStub.calledOnce).to.be.false()
    expect(dbClusterDescribeStub.calledOnce).to.be.false()
    expect(createDbClusterSyncTaskStub.calledOnce).to.be.false()
  })

  it('throws PermissionError when space is null', async () => {
    getEditableByIdStub.resolves(null)

    await expect(
      getInstance().createDbCluster({
        name: 'space-cluster',
        scope: 'space-1',
        engine: ENGINES.POSTGRESQL,
        engineVersion: '14.6',
        dxInstanceClass: 'db_std1_x2',
      }),
    ).to.be.rejectedWith(PermissionError, `Unable to create DbCluster in selected context.`)
    expect(dbClusterCreateStub.calledOnce).to.be.false()
    expect(dbClusterDescribeStub.calledOnce).to.be.false()
    expect(createDbClusterSyncTaskStub.calledOnce).to.be.false()
  })

  function getInstance(): DbClusterCreateFacade {
    const em = {
      persistAndFlush: persistAndFlushStub,
    } as unknown as EntityManager
    const dbClusterRepo = {
      create: createStub,
    } as unknown as DbClusterRepository
    const dbClusterService = new DbClusterService(em, dbClusterRepo)
    const userClient = {
      dbClusterCreate: dbClusterCreateStub,
      dbClusterDescribe: dbClusterDescribeStub,
    } as unknown as PlatformClient
    const adminClient = {
      dbClusterCreate: dbClusterCreateStub,
    } as unknown as PlatformClient
    const spaceService = {
      getEditableById: getEditableByIdStub,
    } as unknown as SpaceService
    const mainJobProducer = {
      createDbClusterSyncTask: createDbClusterSyncTaskStub,
    } as unknown as MainQueueJobProducer
    return new DbClusterCreateFacade(
      dbClusterService,
      userContext,
      userClient,
      adminClient,
      spaceService,
      mainJobProducer,
    )
  }
})
