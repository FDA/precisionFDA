import { EntityManager } from '@mikro-orm/mysql'
import { STATUS } from '@shared/domain/db-cluster/db-cluster.enum'
import { DbClusterRepository } from '@shared/domain/db-cluster/db-cluster.repository'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Uid } from '@shared/domain/entity/domain/uid'
import { SpaceMembershipService } from '@shared/domain/space-membership/space-membership.service'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { STATIC_SCOPE } from '@shared/enums'
import { PermissionError } from '@shared/errors'
import { DbClusterListFacade } from 'apps/api/src/facade/db-cluster/list-facade/db-cluster-list.facade'
import { expect } from 'chai'
import { match, stub } from 'sinon'

describe('DbClusterListFacade', () => {
  const USER_ID = 0
  const accessibleSpaces = stub()
  const USER = {
    id: USER_ID,
    fullName: 'John Doe',
    dxuser: 'john_doe',
    accessibleSpaces,
  }
  const loadEntity = stub()
  const userContext: UserContext = {
    ...USER,
    accessToken: 'accessToken',
    dxuser: 'dxuser',
    loadEntity,
  }

  const paginateStub = stub()
  const getAccessibleByIdStub = stub()
  const getCurrentMembershipStub = stub()
  const isInSpace = stub()
  const getProperty = stub()
  const getEntity = stub()
  const getItems = stub()
  const getSpaceId = stub()

  beforeEach(async () => {
    paginateStub.reset()
    paginateStub.throws()

    getAccessibleByIdStub.reset()
    getAccessibleByIdStub.throws()

    accessibleSpaces.reset()
    accessibleSpaces.throws()

    loadEntity.reset()
    loadEntity.throws()

    getCurrentMembershipStub.reset()
    getCurrentMembershipStub.throws()

    isInSpace.reset()
    isInSpace.throws()
    getEntity.reset()
    getEntity.throws()
    getProperty.reset()
    getProperty.throws()
    getItems.reset()
    getItems.throws()
    getSpaceId.reset()
    getSpaceId.throws()
  })

  it('lists private db clusters', async () => {
    const dbCluster1 = {
      dxid: 'dbcluster-xxx1' as DxId<'dbcluster'>,
      name: 'db-cluster-1',
      project: 'project-xxx1',
      status: STATUS.STOPPED,
      scope: 'private',
      uid: 'dbcluster-xxx1-1' as Uid<'dbcluster'>,
      user: { getProperty, getEntity },
      taggings: [],
      properties: { getItems },
      isInSpace,
    }
    const dbCluster2 = {
      dxid: 'dbcluster-xxx2' as DxId<'dbcluster'>,
      name: 'db-cluster-2',
      project: 'project-xxx2',
      status: STATUS.AVAILABLE,
      scope: 'private',
      uid: 'dbcluster-xxx2-1' as Uid<'dbcluster'>,
      user: { getProperty, getEntity },
      taggings: [],
      properties: { getItems },
      isInSpace,
    }
    loadEntity.resolves(USER)
    paginateStub.withArgs(match({ scope: 'private' })).resolves({ data: [dbCluster1, dbCluster2] })
    isInSpace.returns(false)
    getProperty.withArgs('dxuser').returns(USER.dxuser)
    getProperty.withArgs('fullName').returns(USER.fullName)
    getItems.returns([])
    getEntity.returns(USER)

    const result = await getInstance().listDbClusters({ scope: 'private' })

    expect(result.data).to.have.length(2)
    expect(result.data.map((c) => c.name)).to.include.members([dbCluster1.name, dbCluster2.name])
    expect(result.data.every((c) => c.scope === STATIC_SCOPE.PRIVATE)).to.be.true()
    expect(result.data[0].dxid).eq('dbcluster-xxx1')
    expect(result.data[1].dxid).eq('dbcluster-xxx2')
  })

  it('lists db clusters in space', async () => {
    const dbCluster1 = {
      dxid: 'dbcluster-xxx1' as DxId<'dbcluster'>,
      name: 'db-cluster-1',
      project: 'project-xxx1',
      status: STATUS.STOPPED,
      scope: 'space-1',
      uid: 'dbcluster-xxx1-1' as Uid<'dbcluster'>,
      user: { getProperty, getEntity },
      taggings: [],
      properties: { getItems },
      isInSpace,
      getSpaceId,
    }
    const dbCluster2 = {
      dxid: 'dbcluster-xxx2' as DxId<'dbcluster'>,
      name: 'db-cluster-2',
      project: 'project-xxx2',
      status: STATUS.AVAILABLE,
      scope: 'space-1',
      uid: 'dbcluster-xxx2-1' as Uid<'dbcluster'>,
      user: { getProperty, getEntity },
      taggings: [],
      properties: { getItems },
      isInSpace,
      getSpaceId,
    }
    loadEntity.resolves(USER)
    getAccessibleByIdStub.withArgs(1).resolves({ id: 1 })
    paginateStub.withArgs(match({ scope: 'space-1' })).resolves({ data: [dbCluster1, dbCluster2] })
    isInSpace.returns(true)
    getProperty.withArgs('dxuser').returns(USER.dxuser)
    getProperty.withArgs('fullName').returns(USER.fullName)
    getItems.returns([])
    getEntity.returns(USER)
    getSpaceId.returns(1)
    getCurrentMembershipStub.withArgs(1, 0).resolves({ role: 0 })

    const result = await getInstance().listDbClusters({ scope: 'space-1' })

    expect(result.data).to.have.length(2)
    expect(result.data.map((c) => c.name)).to.include.members([dbCluster1.name, dbCluster2.name])
    expect(result.data.every((c) => c.scope === 'space-1')).to.be.true()
    expect(result.data[0].dxid).eq('dbcluster-xxx1')
    expect(result.data[1].dxid).eq('dbcluster-xxx2')
  })

  it('filter private db clusters by name', async () => {
    const dbCluster = {
      dxid: 'dbcluster-xxx' as DxId<'dbcluster'>,
      name: 'db-cluster',
      project: 'project-xxx',
      status: STATUS.STOPPED,
      scope: 'private',
      uid: 'dbcluster-xxx-1' as Uid<'dbcluster'>,
      user: { getProperty, getEntity },
      taggings: [],
      properties: { getItems },
      isInSpace,
      getSpaceId,
    }

    loadEntity.resolves(USER)
    paginateStub
      .withArgs(match({ scope: 'private', filters: { name: 'db' } }))
      .resolves({ data: [dbCluster] })
    getProperty.withArgs('dxuser').returns(USER.dxuser)
    getProperty.withArgs('fullName').returns(USER.fullName)
    getItems.returns([])
    getEntity.returns(USER)
    isInSpace.returns(false)

    const result = await getInstance().listDbClusters({ scope: 'private', filters: { name: 'db' } })

    expect(result.data).to.have.length(1)
    expect(result.data[0].name).to.equal(dbCluster.name)
    expect(result.data[0].scope).to.equal('private')
  })

  it('throws PermissionError when listing db clusters in space as non member', async () => {
    loadEntity.resolves(USER)
    getAccessibleByIdStub.withArgs(1).resolves(null)

    await expect(getInstance().listDbClusters({ scope: 'space-1' })).to.be.rejectedWith(
      PermissionError,
      `Unable to list DbClusters in selected context.`,
    )
  })

  it('lists db clusters from all user spaces', async () => {
    const dbCluster1 = {
      dxid: 'dbcluster-xxx1' as DxId<'dbcluster'>,
      name: 'db-cluster-1',
      project: 'project-xxx1',
      status: STATUS.STOPPED,
      scope: 'space-1',
      uid: 'dbcluster-xxx1-1' as Uid<'dbcluster'>,
      user: { getProperty, getEntity },
      taggings: [],
      properties: { getItems },
      isInSpace,
      getSpaceId,
    }
    const dbCluster2 = {
      dxid: 'dbcluster-xxx2' as DxId<'dbcluster'>,
      name: 'db-cluster-2',
      project: 'project-xxx2',
      status: STATUS.AVAILABLE,
      scope: 'space-2',
      uid: 'dbcluster-xxx2-1' as Uid<'dbcluster'>,
      user: { getProperty, getEntity },
      taggings: [],
      properties: { getItems },
      isInSpace,
      getSpaceId,
    }

    loadEntity.resolves(USER)
    accessibleSpaces.resolves([
      {
        id: 1,
      },
      {
        id: 2,
      },
    ])
    paginateStub.withArgs(match({ scope: 'spaces' })).resolves({ data: [dbCluster1, dbCluster2] })
    getProperty.withArgs('dxuser').returns(USER.dxuser)
    getProperty.withArgs('fullName').returns(USER.fullName)
    getItems.returns([])
    getEntity.returns(USER)
    isInSpace.returns(true)
    getSpaceId.onFirstCall().returns(1)
    getSpaceId.onSecondCall().returns(2)
    getCurrentMembershipStub.withArgs(1, 0).resolves({ role: 0 })
    getCurrentMembershipStub.withArgs(2, 0).resolves({ role: 2 })

    const result = await getInstance().listDbClusters({ scope: 'spaces' })

    expect(result.data).to.have.length(2)
    expect(result.data.map((c) => c.name)).to.include.members([dbCluster1.name, dbCluster2.name])
    expect(result.data.every((c) => ['space-1', 'space-2'].includes(c.scope))).to.be.true()
  })

  it('returns empty array when user has no space membership', async () => {
    loadEntity.resolves(USER)
    accessibleSpaces.resolves([])
    paginateStub.withArgs(match({ scope: 'spaces' })).resolves({ data: [] })

    const result = await getInstance().listDbClusters({ scope: 'spaces' })

    expect(result.data).to.have.length(0)
  })

  function getInstance(): DbClusterListFacade {
    const em = {} as unknown as EntityManager
    const dbClusterRepo = {
      paginate: paginateStub,
    } as unknown as DbClusterRepository
    const spaceMembershipService = {
      getCurrentMembership: getCurrentMembershipStub,
    } as unknown as SpaceMembershipService
    const dbClusterService = new DbClusterService(em, dbClusterRepo)
    const spaceService = {
      getAccessibleById: getAccessibleByIdStub,
    } as unknown as SpaceService

    return new DbClusterListFacade(
      dbClusterService,
      userContext,
      spaceService,
      spaceMembershipService,
    )
  }
})
