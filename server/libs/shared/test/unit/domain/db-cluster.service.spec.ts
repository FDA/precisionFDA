import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { ENGINE } from '@shared/domain/db-cluster/db-cluster.enum'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { PlatformClient } from '@shared/platform-client'
import { MainQueueJobProducer } from '@shared/queue/producer/main-queue-job.producer'
import { expect } from 'chai'
import { stub } from 'sinon'
import { create, db } from '../../../src/test'

describe('DbClusterService tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let userCtx: UserCtx
  let dbClusterService: DbClusterService
  const createStub = stub()
  const describeStub = stub()
  const createSyncTaskStub = stub()

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>
    user = create.userHelper.create(em)
    await em.flush()
    userCtx = { ...user, accessToken: 'foo' }

    createStub.returns({ id: 'dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82' })
    describeStub.returns({
      id: 'dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82',
      project: 'project-1',
      name: 'db-cluster-1',
      dxInstanceClass: 'db_std1_x2',
      engine: 'aurora-postgresql',
      engineVersion: '14.6',
      status: 'creating',
      endpoint: 'dbcluster-ggpkg7q0z0ggfjzjkjgg3bf2.cluster-cfzitlm9q1kq.us-east-1.rds.amazonaws.com',
      port: 5432,
      statusAsOf: 1634160000000,
    })

    const client = {
      dbClusterCreate: createStub,
      dbClusterDescribe: describeStub,
    } as unknown as PlatformClient

    const mainJobProducer = {
      createDbClusterSyncTask: createSyncTaskStub,
    } as unknown as MainQueueJobProducer

    dbClusterService = new DbClusterService(em, userCtx, client, mainJobProducer)
  })

  it('creates db-cluster', async () => {
    const dbCluster = await dbClusterService.create({
      name: 'db-cluster-1',
      scope: STATIC_SCOPE.PRIVATE,
      description: 'db-cluster-1 description',
      project: 'project-1',
      engine: ENGINE.POSTGRESQL,
      adminPassword: 'super-secret-password',
      engineVersion: '14.6',
      dxInstanceClass: 'db_std1_x2',
    })

    expect(dbCluster.id).eq(1)
    expect(dbCluster.dxid).eq('dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82')
    expect(dbCluster.uid).eq('dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82-1')
    expect(dbCluster.name).eq('db-cluster-1')
    expect(dbCluster.scope).eq(STATIC_SCOPE.PRIVATE)
    expect(dbCluster.description).eq('db-cluster-1 description')
    expect(dbCluster.project).eq('project-1')
    expect(dbCluster.engine).eq(ENGINE.POSTGRESQL)
    expect(dbCluster.engineVersion).eq('14.6')
    expect(dbCluster.dxInstanceClass).eq('db_std1_x2')
  })

  it('creates sync operation for db-cluster', async () => {

    createSyncTaskStub.reset()

    await dbClusterService.create({
      name: 'db-cluster-1',
      scope: STATIC_SCOPE.PRIVATE,
      description: 'db-cluster-1 description',
      project: 'project-1',
      engine: ENGINE.POSTGRESQL,
      adminPassword: 'super-secret-password',
      engineVersion: '14.6',
      dxInstanceClass: 'db_std1_x2',
    })

    expect(createSyncTaskStub.calledOnce).to.be.true()

  })



})
