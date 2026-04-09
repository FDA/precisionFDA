import { EntityManager } from '@mikro-orm/mysql'
import { DbClusterGetFacade } from 'apps/api/src/facade/db-cluster/get-facade/db-cluster-get.facade'
import { expect } from 'chai'
import { stub } from 'sinon'
import { STATUS } from '@shared/domain/db-cluster/db-cluster.enum'
import { DbClusterRepository } from '@shared/domain/db-cluster/db-cluster.repository'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'
import { DbClusterCountService } from '@shared/domain/db-cluster/service/db-cluster-count.service'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Uid } from '@shared/domain/entity/domain/uid'
import { LicenseService } from '@shared/domain/license/license.service'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { SpaceMembershipService } from '@shared/domain/space-membership/service/space-membership.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { STATIC_SCOPE } from '@shared/enums'
import { NotFoundError } from '@shared/errors'

describe('DbClusterGetFacade', () => {
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
  const getAccessibleByIdStub = stub()
  const findAccessibleOneStub = stub()
  const getCurrentMembershipStub = stub()
  const findLicenseRefByLicenseableIdStub = stub()

  const isConfidential = stub()
  const isPrivate = stub()
  const getProperty = stub()
  const getEntity = stub()
  const getItems = stub()

  beforeEach(async () => {
    getAccessibleByIdStub.reset()
    getAccessibleByIdStub.throws()
    findAccessibleOneStub.reset()
    findAccessibleOneStub.throws()
    loadEntity.reset()
    loadEntity.throws()
    isPrivate.reset()
    isPrivate.throws()
    getEntity.reset()
    getEntity.throws()
    isConfidential.reset()
    isConfidential.throws()
    getItems.reset()
    getItems.throws()
    getProperty.reset()
    getProperty.throws()
    getCurrentMembershipStub.reset()
    getCurrentMembershipStub.throws()
    findLicenseRefByLicenseableIdStub.reset()
    findLicenseRefByLicenseableIdStub.resolves(undefined)
  })

  it('gets private db cluster for owner', async () => {
    const dbCluster = {
      dxid: 'dbcluster-xxx' as DxId<'dbcluster'>,
      name: 'db-cluster-1',
      project: 'project-xxx',
      status: STATUS.AVAILABLE,
      scope: 'private',
      uid: 'dbcluster-xxx-1' as Uid<'dbcluster'>,
      isPrivate,
      user: { getProperty, getEntity },
      taggings: [],
      properties: { getItems },
    }
    findAccessibleOneStub
      .withArgs(
        { uid: dbCluster.uid },
        {
          populate: ['user', 'properties', 'taggings.tag'],
        },
      )
      .resolves(dbCluster)
    loadEntity.resolves(USER)
    isPrivate.returns(true)
    getProperty.withArgs('dxuser').returns(USER.dxuser)
    getProperty.withArgs('fullName').returns(USER.fullName)
    getItems.returns([])
    getEntity.returns(USER)
    const result = await getInstance().getDbCluster(dbCluster.uid)

    expect(result).to.exist()
    expect(result.name).to.equal('db-cluster-1')
    expect(result.scope).to.equal(STATIC_SCOPE.PRIVATE)
    expect(result.status).to.equal('available')
    expect(result.dxid).to.equal('dbcluster-xxx')
    expect(result.uid).to.equal('dbcluster-xxx-1')
    expect(result.addedBy).to.equal('john_doe')
    expect(loadEntity.notCalled).to.be.true()
  })

  it('gets space db cluster for space member', async () => {
    const dbCluster = {
      dxid: 'dbcluster-xxx' as DxId<'dbcluster'>,
      name: 'db-cluster-1',
      project: 'project-xxx',
      status: STATUS.AVAILABLE,
      scope: 'space-1',
      uid: 'dbcluster-xxx-1' as Uid<'dbcluster'>,
      isPrivate,
      user: { getProperty, getEntity },
      taggings: [],
      properties: { getItems },
    }
    findAccessibleOneStub
      .withArgs(
        { uid: dbCluster.uid },
        {
          populate: ['user', 'properties', 'taggings.tag'],
        },
      )
      .resolves(dbCluster)
    loadEntity.resolves(USER)
    isPrivate.returns(false)
    getAccessibleByIdStub.withArgs(1).resolves({ id: 1, name: 'space-1', isConfidential })

    isConfidential.returns(false)
    getProperty.withArgs('dxuser').returns(USER.dxuser)
    getProperty.withArgs('fullName').returns(USER.fullName)
    getItems.returns([])
    getEntity.returns(USER)

    getCurrentMembershipStub.withArgs(1, 1).resolves({ role: 3 })

    const result = await getInstance().getDbCluster(dbCluster.uid)

    expect(result).to.exist()
    expect(result.name).to.equal('db-cluster-1')
    expect(result.scope).to.equal('space-1')
    expect(result.status).to.equal('available')
    expect(result.dxid).to.equal('dbcluster-xxx')
    expect(result.uid).to.equal('dbcluster-xxx-1')
    expect(result.addedBy).to.equal('john_doe')
    expect(result.location).to.equal('space-1 - Shared')
    expect(loadEntity.notCalled).to.be.true()
  })

  it('should throw NotFoundError when db cluster does not exist or is not accessible', async () => {
    findAccessibleOneStub
      .withArgs(
        { uid: 'dbcluster-123-1' },
        {
          populate: ['user', 'properties', 'taggings.tag'],
        },
      )
      .resolves(null)
    await expect(getInstance().getDbCluster('dbcluster-123-1')).to.be.rejectedWith(
      NotFoundError,
      `DbCluster not found or not accessible`,
    )
    expect(loadEntity.calledOnce).to.be.false()
  })

  function getInstance(): DbClusterGetFacade {
    const em = {} as unknown as EntityManager
    const dbClusterRepo = {
      findAccessibleOne: findAccessibleOneStub,
    } as unknown as DbClusterRepository
    const notificationService = {} as unknown as NotificationService
    const dbClusterCountService = { count: stub().resolves(0) } as unknown as DbClusterCountService
    const dbClusterService = new DbClusterService(
      em,
      dbClusterRepo,
      userContext,
      notificationService,
      dbClusterCountService,
    )
    const spaceMembershipService = {
      getCurrentMembership: getCurrentMembershipStub,
    } as unknown as SpaceMembershipService
    const spaceService = {
      getAccessibleById: getAccessibleByIdStub,
    } as unknown as SpaceService
    const licenseService = {
      findLicenseRefByLicenseableId: findLicenseRefByLicenseableIdStub,
    } as unknown as LicenseService

    return new DbClusterGetFacade(dbClusterService, userContext, spaceService, spaceMembershipService, licenseService)
  }
})
