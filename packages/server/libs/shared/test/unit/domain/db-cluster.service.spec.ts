import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { ENGINE, ENGINES, STATUS, STATUSES } from '@shared/domain/db-cluster/db-cluster.enum'
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
import { DbClusterRepository } from '@shared/domain/db-cluster/db-cluster.repository'
import { Space } from '@shared/domain/space/space.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { Uid } from '@shared/domain/entity/domain/uid'
import { NotFoundError, PermissionError } from '@shared/errors'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'
import { DbClusterDTO } from '@shared/domain/db-cluster/dto/db-cluster.dto'
import { invertObj } from 'ramda'
import { UserRepository } from '@shared/domain/user/user.repository'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { UsersDbClustersSaltRepository } from '@shared/domain/db-cluster/access-control/users-db-clusters-salt.repository'
import { SPACE_STATE } from '@shared/domain/space/space.enum'

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
  const paginateStub = stub()
  const mapToDTOStub = stub(DbClusterDTO, 'mapToDTO')

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

    // Make describeStub return different data based on the input dxid
    describeStub.callsFake((params) => {
      const responses = {
        'dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82': {
          id: 'dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82',
          project: 'project-1',
          name: 'private-cluster-1',
          dxInstanceClass: 'db_std1_x2',
          engine: 'aurora-postgresql',
          engineVersion: '14.6',
          status: 'creating',
          endpoint: 'dbcluster-1.cluster-xyz.us-east-1.rds.amazonaws.com',
          port: 5432,
          statusAsOf: 1634160000000,
        },
        'dbcluster-HZyk9Z80Z0gvz8ky0F1yzF83': {
          id: 'dbcluster-HZyk9Z80Z0gvz8ky0F1yzF83',
          project: 'project-1',
          name: 'private-cluster-2',
          dxInstanceClass: 'db_std1_x2',
          engine: 'aurora-postgresql',
          engineVersion: '14.6',
          status: 'creating',
          endpoint: 'dbcluster-2.cluster-xyz.us-east-1.rds.amazonaws.com',
          port: 5432,
          statusAsOf: 1634160000000,
        },
        'dbcluster-IZzk9Z80Z0gvz8ky0F1yzF84': {
          id: 'dbcluster-IZzk9Z80Z0gvz8ky0F1yzF84',
          project: 'project-2',
          name: 'space-cluster-1',
          dxInstanceClass: 'db_std1_x2',
          engine: 'aurora-postgresql',
          engineVersion: '14.6',
          status: 'creating',
          endpoint: 'dbcluster-3.cluster-xyz.us-east-1.rds.amazonaws.com',
          port: 5432,
          statusAsOf: 1634160000000,
        },
        'dbcluster-JZwk9Z80Z0gvz8ky0F1yzF85': {
          id: 'dbcluster-JZwk9Z80Z0gvz8ky0F1yzF85',
          project: 'project-2',
          name: 'space-cluster-2',
          dxInstanceClass: 'db_std1_x2',
          engine: 'aurora-postgresql',
          engineVersion: '14.6',
          status: 'creating',
          endpoint: 'dbcluster-4.cluster-xyz.us-east-1.rds.amazonaws.com',
          port: 5432,
          statusAsOf: 1634160000000,
        },
      }

      return responses[params.dxid] || responses['dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82']
    })

    paginateStub.onCall(1).returns({
      data: [
        {
          id: 'dbcluster-IZzk9Z80Z0gvz8ky0F1yzF84',
          project: 'project-2',
          scope: 'space-1',
          name: 'space-cluster-1',
          dxInstanceClass: 'db_std1_x2',
          engine: 'aurora-postgresql',
          engineVersion: '14.6',
          status: 'creating',
          endpoint: 'dbcluster-3.cluster-xyz.us-east-1.rds.amazonaws.com',
          port: 5432,
          statusAsOf: 1634160000000,
        },
      ],
    })
    paginateStub.returns({
      data: [
        {
          id: 'dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82',
          project: 'project-1',
          scope: 'private',
          name: 'private-cluster-1',
          dxInstanceClass: 'db_std1_x2',
          engine: 'aurora-postgresql',
          engineVersion: '14.6',
          status: 'creating',
          endpoint: 'dbcluster-1.cluster-xyz.us-east-1.rds.amazonaws.com',
          port: 5432,
          statusAsOf: 1634160000000,
        },
      ],
    })

    const client = {
      dbClusterCreate: createStub,
      dbClusterDescribe: describeStub,
    } as unknown as PlatformClient

    const adminclient = {
      dbClusterCreate: createStub,
    } as unknown as PlatformClient

    const mainJobProducer = {
      createDbClusterSyncTask: createSyncTaskStub,
    } as unknown as MainQueueJobProducer

    const emailsJobProducer = {
      createSendEmailTask: createSendEmailTask,
    } as unknown as EmailQueueJobProducer

    mapToDTOStub.callsFake(
      (dbCluster) =>
        ({
          id: dbCluster.id,
          uid: dbCluster.uid,
          dxid: dbCluster.dxid,
          name: dbCluster.name,
          description: dbCluster.description,
          scope: dbCluster.scope,
          project: dbCluster.project,
          engine: dbCluster.engine,
          engineVersion: dbCluster.engineVersion,
          dxInstanceClass: dbCluster.dxInstanceClass,
          status: STATUSES[invertObj(STATUS)[dbCluster.status]],
          port: dbCluster.port,
          createdAt: dbCluster.createdAt,
          updatedAt: dbCluster.updatedAt,
        }) as any,
    )

    const dbclusterRepository = new DbClusterRepository(em, 'DbCluster')
    const userRepository = new UserRepository(em, 'User')
    const spaceRepository = new SpaceRepository(em, 'Space')
    const spaceMembershipsRepository = new SpaceMembershipRepository(em, 'SpaceMembership')
    const saltRepository = new UsersDbClustersSaltRepository(em, 'UsersDbClustersSalt')

    dbClusterService = new DbClusterService(
      em,
      userCtx,
      client,
      mainJobProducer,
      emailsJobProducer,
      dbclusterRepository,
      userRepository,
      spaceRepository,
      spaceMembershipsRepository,
      saltRepository,
      adminclient,
    )

    getJobStub.reset()
    getJobStub.throws()
  })

  afterEach(() => {
    getJobStub.restore()
  })

  it('creates db-cluster', async () => {
    createStub.returns({ id: 'dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82' })

    const dbCluster = await dbClusterService.create({
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
    expect(dbCluster.description).eq('private-cluster-1 description')
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
    createStub.returns({ id: 'dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82' })
    await dbClusterService.create({
      name: 'db-cluster-1',
      scope: STATIC_SCOPE.PRIVATE,
      description: 'db-cluster-1 description',
      engine: ENGINES.POSTGRESQL,
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
        create.dbClusterHelper.create(
          em,
          { user: user1 },
          { status: DB_CLUSTER_STATUS.TERMINATED },
        ),
        create.dbClusterHelper.create(em, { user: user2 }, { status: DB_CLUSTER_STATUS.AVAILABLE }),
        create.dbClusterHelper.create(em, { user: user2 }, { status: DB_CLUSTER_STATUS.STOPPING }),
        create.dbClusterHelper.create(
          em,
          { user: user2 },
          { status: DB_CLUSTER_STATUS.TERMINATED },
        ),
      ]

      getJobStub.returns({
        getJob: stub().returns({}),
      })

      const result = await dbClusterService.checkNonTerminatedDbClusters()

      expect(result.length).to.eq(4)
      expect(createSendEmailTask.callCount).to.equal(2)
      expect(createSendEmailTask.getCall(0).args[0].emailType).to.equal(
        EMAIL_TYPES.nonTerminatedDbClusters,
      )
      expect(createSendEmailTask.getCall(1).args[0].emailType).to.equal(
        EMAIL_TYPES.nonTerminatedDbClusters,
      )
      expect(createSendEmailTask.getCall(0).args[0].to).to.equal(
        `${config.platform.adminUser}@dnanexus.com`,
      )
      expect(createSendEmailTask.getCall(1).args[0].to).to.equal(
        `precisionfda-no-reply@dnanexus.com`,
      )
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

  describe('getDbCluster', () => {
    let privateCluster: DbCluster
    let spaceCluster: DbCluster
    let space: Space

    it('gets private cluster for owner', async () => {
      createStub.returns({ id: 'dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82' })
      privateCluster = await dbClusterService.create({
        name: 'private-cluster-1',
        scope: STATIC_SCOPE.PRIVATE,
        description: 'private cluster',
        engine: ENGINES.POSTGRESQL,
        engineVersion: '14.6',
        dxInstanceClass: 'db_std1_x2',
      })

      const result = await dbClusterService.getDbCluster(privateCluster.uid)

      expect(result.db_cluster).to.exist
      expect(result.db_cluster.name).to.equal('private-cluster-1')
      expect(result.db_cluster.scope).to.equal(STATIC_SCOPE.PRIVATE)
    })

    it('gets space cluster for space member', async () => {
      createStub.returns({ id: 'dbcluster-IZzk9Z80Z0gvz8ky0F1yzF84' })

      space = em.create(Space, {
        name: 'test-space',
        description: 'test space',
        state: SPACE_STATE.ACTIVE,
        hostProject: 'project-xxxx',
      })
      await em.flush()

      const spaceMembership = new SpaceMembership(
        user,
        space,
        SPACE_MEMBERSHIP_SIDE.HOST,
        SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR,
      )
      em.persist(spaceMembership)
      await em.flush()

      spaceCluster = await dbClusterService.create({
        name: 'space-cluster-1',
        scope: `space-${space.id}`,
        description: 'space cluster',
        engine: ENGINES.POSTGRESQL,
        engineVersion: '14.6',
        dxInstanceClass: 'db_std1_x2',
      })

      const result = await dbClusterService.getDbCluster(spaceCluster.uid)

      expect(result.db_cluster).to.exist
      expect(result.db_cluster.name).to.equal('space-cluster-1')
      expect(result.db_cluster.scope).to.equal(`space-${space.id}`)
    })

    it('throws NotFoundError when cluster does not exist', async () => {
      const nonExistentUid = 'dbcluster-nonexistent-1' as Uid<'dbcluster'>

      await expect(dbClusterService.getDbCluster(nonExistentUid)).to.be.rejectedWith(
        NotFoundError,
        `DbCluster ${nonExistentUid} not found.`,
      )
    })

    it('throws PermissionError when accessing another user private cluster', async () => {
      createStub.returns({ id: 'dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82' })
      privateCluster = await dbClusterService.create({
        name: 'private-cluster-1',
        scope: STATIC_SCOPE.PRIVATE,
        description: 'private cluster',
        engine: ENGINES.POSTGRESQL,
        engineVersion: '14.6',
        dxInstanceClass: 'db_std1_x2',
      })
      // Create service with different user
      const client = {} as unknown as PlatformClient
      const adminClient = {} as unknown as PlatformClient
      const mainJobProducer = {} as unknown as MainQueueJobProducer
      const emailsJobProducer = {} as unknown as EmailQueueJobProducer
      const dbclusterRepository = new DbClusterRepository(em, 'DbCluster')
      const userRepository = new UserRepository(em, 'User')
      const spaceRepository = new SpaceRepository(em, 'Space')
      const spaceMembershipsRepository = new SpaceMembershipRepository(em, 'SpaceMembership')
      const saltRepository = new UsersDbClustersSaltRepository(em, 'UsersDbClustersSalt')

      const otherUserService = new DbClusterService(
        em,
        { ...user1, accessToken: 'foo' },
        client,
        mainJobProducer,
        emailsJobProducer,
        dbclusterRepository,
        userRepository,
        spaceRepository,
        spaceMembershipsRepository,
        saltRepository,
        adminClient,
      )

      await expect(otherUserService.getDbCluster(privateCluster.uid)).to.be.rejectedWith(
        PermissionError,
        `You don't have access to this DbCluster`,
      )
    })

    it('throws PermissionError when accessing space cluster as non member', async () => {
      createStub.returns({ id: 'dbcluster-IZzk9Z80Z0gvz8ky0F1yzF84' })

      space = em.create(Space, {
        name: 'test-space',
        description: 'test space',
        state: SPACE_STATE.ACTIVE,
        hostProject: 'project-xxxx',
      })
      await em.flush()

      const spaceMembership = new SpaceMembership(
        user,
        space,
        SPACE_MEMBERSHIP_SIDE.HOST,
        SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR,
      )
      em.persist(spaceMembership)
      await em.flush()

      spaceCluster = await dbClusterService.create({
        name: 'space-cluster-1',
        scope: `space-${space.id}`,
        description: 'space cluster',
        engine: ENGINES.POSTGRESQL,
        engineVersion: '14.6',
        dxInstanceClass: 'db_std1_x2',
      })

      const client = {} as unknown as PlatformClient
      const adminClient = {} as unknown as PlatformClient
      const mainJobProducer = {} as unknown as MainQueueJobProducer
      const emailsJobProducer = {} as unknown as EmailQueueJobProducer
      const dbclusterRepository = new DbClusterRepository(em, 'DbCluster')
      const userRepository = new UserRepository(em, 'User')
      const spaceRepository = new SpaceRepository(em, 'Space')
      const spaceMembershipsRepository = new SpaceMembershipRepository(em, 'SpaceMembership')
      const saltRepository = new UsersDbClustersSaltRepository(em, 'UsersDbClustersSalt')

      const otherUserService = new DbClusterService(
        em,
        { ...user1, accessToken: 'foo' },
        client,
        mainJobProducer,
        emailsJobProducer,
        dbclusterRepository,
        userRepository,
        spaceRepository,
        spaceMembershipsRepository,
        saltRepository,
        adminClient,
      )

      await expect(otherUserService.getDbCluster(spaceCluster.uid)).to.be.rejectedWith(
        PermissionError,
        `Unable to get DbCluster in selected context.`,
      )
    })
  })

  describe('list', () => {
    let space: Space
    let privateCluster1: DbCluster
    let spaceCluster: DbCluster

    it('lists private clusters when scope: private provided', async () => {
      createStub.returns({ id: 'dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82' })

      privateCluster1 = await dbClusterService.create({
        name: 'private-cluster-1',
        scope: STATIC_SCOPE.PRIVATE,
        description: 'private cluster 1',
        engine: ENGINES.POSTGRESQL,
        engineVersion: '14.6',
        dxInstanceClass: 'db_std1_x2',
      })

      const result = await dbClusterService.list({ scope: 'private' })

      expect(result.data).to.have.length(1)
      expect(result.data.map((c) => c.name)).to.include.members(['private-cluster-1'])
      expect(result.data.every((c) => c.scope === STATIC_SCOPE.PRIVATE)).to.be.true
    })

    it('lists space clusters when scope: space_id provided', async () => {
      createStub.returns({ id: 'dbcluster-IZzk9Z80Z0gvz8ky0F1yzF84' })

      space = em.create(Space, {
        name: 'test-space',
        description: 'test space',
        state: SPACE_STATE.ACTIVE,
        hostProject: 'project-xxx',
      })
      await em.flush()

      const spaceMembership = new SpaceMembership(
        user,
        space,
        SPACE_MEMBERSHIP_SIDE.HOST,
        SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR,
      )
      em.persist(spaceMembership)
      await em.flush()

      spaceCluster = await dbClusterService.create({
        name: 'space-cluster-1',
        scope: `space-${space.id}`,
        description: 'space cluster',
        engine: ENGINES.POSTGRESQL,
        engineVersion: '14.6',
        dxInstanceClass: 'db_std1_x2',
      })
      const result = await dbClusterService.list({ scope: `space-${space.id}` })

      expect(result.data).to.have.length(1)
      expect(result.data[0].name).to.equal('space-cluster-1')
      expect(result.data[0].scope).to.equal(`space-${space.id}`)
    })

    it('filters clusters by name', async () => {
      createStub.returns({ id: 'dbcluster-GZxk9Z80Z0gvz8ky0F1yzF82' })

      privateCluster1 = await dbClusterService.create({
        name: 'private-cluster-1',
        scope: STATIC_SCOPE.PRIVATE,
        description: 'private cluster 1',
        engine: ENGINES.POSTGRESQL,
        engineVersion: '14.6',
        dxInstanceClass: 'db_std1_x2',
      })

      const result = await dbClusterService.list({
        scope: 'private',
        filters: { name: 'cluster-1' },
      })

      expect(result.data).to.have.length(1)
      expect(result.data[0].name).to.equal('private-cluster-1')
    })

    it('throws PermissionError when listing clusters in unauthorized space', async () => {
      const otherSpace = em.create(Space, {
        name: 'other-space',
        description: 'other space',
      })
      await em.flush()

      await expect(dbClusterService.list({ scope: `space-${otherSpace.id}` })).to.be.rejectedWith(
        PermissionError,
        'Unable to list DbClusters in selected context.',
      )
    })
  })

  describe('listInSpaces', () => {
    let space1: Space
    let spaceCluster1: DbCluster

    it('lists clusters from all user spaces', async () => {
      createStub.returns({ id: 'dbcluster-IZzk9Z80Z0gvz8ky0F1yzF84' })

      space1 = em.create(Space, {
        name: 'test-space',
        description: 'test space',
        state: SPACE_STATE.ACTIVE,
        hostProject: 'project-xxx',
      })
      await em.flush()

      const spaceMembership = new SpaceMembership(
        user,
        space1,
        SPACE_MEMBERSHIP_SIDE.HOST,
        SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR,
      )
      em.persist(spaceMembership)
      await em.flush()

      spaceCluster1 = await dbClusterService.create({
        name: 'space-cluster-1',
        scope: `space-${space1.id}`,
        description: 'space cluster',
        engine: ENGINES.POSTGRESQL,
        engineVersion: '14.6',
        dxInstanceClass: 'db_std1_x2',
      })
      const result = await dbClusterService.list({ scope: 'spaces' })

      expect(result.data).to.have.length(1)
      expect(result.data[0].name).to.equal('space-cluster-1')
    })

    it('filters space clusters by name', async () => {
      createStub.returns({ id: 'dbcluster-IZzk9Z80Z0gvz8ky0F1yzF84' })

      space1 = em.create(Space, {
        name: 'test-space',
        description: 'test space',
        state: SPACE_STATE.ACTIVE,
        hostProject: 'project-xxx',
      })
      await em.flush()

      const spaceMembership = new SpaceMembership(
        user,
        space1,
        SPACE_MEMBERSHIP_SIDE.HOST,
        SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR,
      )
      em.persist(spaceMembership)
      await em.flush()

      spaceCluster1 = await dbClusterService.create({
        name: 'space-cluster-1',
        scope: `space-${space1.id}`,
        description: 'space cluster',
        engine: ENGINES.POSTGRESQL,
        engineVersion: '14.6',
        dxInstanceClass: 'db_std1_x2',
      })

      const result = await dbClusterService.list({
        scope: 'spaces',
        filters: { name: 'cluster-1' },
      })

      expect(result.data).to.have.length(1)
      expect(result.data[0].name).to.equal('space-cluster-1')
    })

    it('returns empty array when user has no space memberships', async () => {
      // Create service with different user that has no space memberships
      const client = {} as unknown as PlatformClient
      const adminClient = {} as unknown as PlatformClient
      const mainJobProducer = {} as unknown as MainQueueJobProducer
      const emailsJobProducer = {} as unknown as EmailQueueJobProducer
      const dbclusterRepository = new DbClusterRepository(em, 'DbCluster')
      const userRepository = new UserRepository(em, 'User')
      const spaceRepository = new SpaceRepository(em, 'Space')
      const spaceMembershipsRepository = new SpaceMembershipRepository(em, 'SpaceMembership')
      const saltRepository = new UsersDbClustersSaltRepository(em, 'UsersDbClustersSalt')

      const otherUserService = new DbClusterService(
        em,
        { ...user1, accessToken: 'foo' },
        client,
        mainJobProducer,
        emailsJobProducer,
        dbclusterRepository,
        userRepository,
        spaceRepository,
        spaceMembershipsRepository,
        saltRepository,
        adminClient,
      )

      const result = await otherUserService.list({
        scope: 'spaces',
      })
      expect(result.data).to.have.length(0)
    })
  })
})
