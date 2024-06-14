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
import { STATUS as DB_CLUSTER_STATUS } from '@shared/domain/db-cluster/db-cluster.enum'
import { EmailQueueJobProducer } from '@shared/domain/email/producer/email-queue-job.producer'
import { DbCluster } from '@shared/domain/db-cluster/db-cluster.entity'
import { EMAIL_TYPES } from '@shared/domain/email/email.config'
import * as queue from '@shared/queue'
import { config } from '@shared/config'

describe('DbClusterService tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let user1: User
  let user2: User
  let dbClusters: DbCluster[]
  let userCtx: UserCtx
  let dbClusterService: DbClusterService
  let getJobStub
  const createStub = stub()
  const describeStub = stub()
  const createSyncTaskStub = stub()
  const createSendEmailTask = stub()

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>
    user = create.userHelper.create(em)
    user1 = create.userHelper.create(em)
    user2 = create.userHelper.create(em)
    create.userHelper.createAdmin(em)
    await em.flush()

    userCtx = { ...user, accessToken: 'foo' }

    getJobStub = stub(queue, 'getMainQueue')

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

    const emailsJobProducer = {
      createSendEmailTask: createSendEmailTask,
    } as unknown as EmailQueueJobProducer

    dbClusterService = new DbClusterService(em, userCtx, client, mainJobProducer, emailsJobProducer)

    getJobStub.reset()
    getJobStub.throws()
  })

  afterEach(() => {
    getJobStub.restore()
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

  it('updates db-cluster', async () => {
    const dbCluster = create.dbClusterHelper.create(em, { user }, { name: 'db-cluster-1' })
    const dbCluster2 = create.dbClusterHelper.create(em, { user }, { name: 'db-cluster-2' })

    const dbCluster2name = dbCluster2.name
    const dbCluster2desc = dbCluster2.description

    await dbClusterService.update(dbCluster.uid, {
      name: 'db-cluster-updated',
      description: 'db-cluster-description-updated',
    })

    expect(dbCluster.name).eq('db-cluster-updated')
    expect(dbCluster.description).eq('db-cluster-description-updated')
    expect(dbCluster2.name).eq(dbCluster2name)
    expect(dbCluster2.description).eq(dbCluster2desc)
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

  context('checkNonTerminatedDbClusters()', async () => {
    it('check four cluster', async () => {
      dbClusters = [
        create.dbClusterHelper.create(em, { user: user1 }, { status: DB_CLUSTER_STATUS.STARTING }),
        create.dbClusterHelper.create(em, { user: user1 }, { status: DB_CLUSTER_STATUS.STOPPED }),
        create.dbClusterHelper.create(em, { user: user1 }, { status: DB_CLUSTER_STATUS.TERMINATED }),
        create.dbClusterHelper.create(em, { user: user2 }, { status: DB_CLUSTER_STATUS.AVAILABLE }),
        create.dbClusterHelper.create(em, { user: user2 }, { status: DB_CLUSTER_STATUS.STOPPING }),
        create.dbClusterHelper.create(em, { user: user2 }, { status: DB_CLUSTER_STATUS.TERMINATED }),
      ]

      getJobStub.returns({
        getJob: stub().returns({ }),
      })

      const result = await dbClusterService.checkNonTerminatedDbClusters()

      expect(result.length).to.eq(4)
      expect(createSendEmailTask.callCount).to.equal(2)
      expect(createSendEmailTask.getCall(0).args[0].emailType).to.equal(EMAIL_TYPES.nonTerminatedDbClusters)
      expect(createSendEmailTask.getCall(1).args[0].emailType).to.equal(EMAIL_TYPES.nonTerminatedDbClusters)
      expect(createSendEmailTask.getCall(0).args[0].to).to.equal(`${config.platform.adminUser}@dnanexus.com`)
      expect(createSendEmailTask.getCall(1).args[0].to).to.equal(`precisionfda-no-reply@dnanexus.com`)
      expect(createSendEmailTask.getCall(0).args[0].subject).to.equal('Non-terminated dbclusters')
      expect(createSendEmailTask.getCall(1).args[0].subject).to.equal('Non-terminated dbclusters')


      const nonTerminatedIndexes = [0, 1, 3, 4]
      nonTerminatedIndexes.forEach((index) => {
        expect(result.find((r) => r.dxid === dbClusters[index].dxid)).to.not.be.undefined()
      })

      // check first and second call to createSendEmailTask
      nonTerminatedIndexes.forEach((index) => {
        expect(createSendEmailTask.getCall(0).args[0].body).to.contain(dbClusters[index].dxid)
      })
      nonTerminatedIndexes.forEach((index) => {
        expect(createSendEmailTask.getCall(1).args[0].body).to.contain(dbClusters[index].dxid)
      })
    })
  })
})
