import { EntityManager } from '@mikro-orm/mysql'
import { DbClusterUpdateFacade } from 'apps/api/src/facade/db-cluster/update-facade/db-cluster-update.facade'
import { expect } from 'chai'
import { stub } from 'sinon'
import { STATUS } from '@shared/domain/db-cluster/db-cluster.enum'
import { DbClusterRepository } from '@shared/domain/db-cluster/db-cluster.repository'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Uid } from '@shared/domain/entity/domain/uid'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { NotFoundError } from '@shared/errors'

describe('DbClusterUpdateFacade', () => {
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

  const findEditableOneStub = stub()
  const transactionalStub = stub()

  beforeEach(async () => {
    findEditableOneStub.reset()
    findEditableOneStub.throws()
    transactionalStub.reset()
    transactionalStub.throws()
  })

  it('updates private db cluster', async () => {
    const dbCluster1 = {
      dxid: 'dbcluster-xxx1' as DxId<'dbcluster'>,
      name: 'db-cluster-1',
      project: 'project-xxx1',
      status: STATUS.STOPPED,
      scope: 'private',
      uid: 'dbcluster-xxx1-1' as Uid<'dbcluster'>,
    }

    findEditableOneStub.withArgs({ uid: dbCluster1.uid }).resolves(dbCluster1)
    transactionalStub.resolves({
      dxid: 'dbcluster-xxx1' as DxId<'dbcluster'>,
      name: 'db-cluster-updated',
      description: 'db-cluster-description-updated',
      project: 'project-xxx1',
      status: STATUS.STOPPED,
      scope: 'private',
      uid: 'dbcluster-xxx1-1' as Uid<'dbcluster'>,
    })

    const dbClusterUpdated = await getInstance().updateDbCluster(dbCluster1.uid, {
      name: 'db-cluster-updated',
      description: 'db-cluster-description-updated',
    })

    expect(dbClusterUpdated.dxid).eq('dbcluster-xxx1')
    expect(dbClusterUpdated.name).eq('db-cluster-updated')
    expect(dbClusterUpdated.description).eq('db-cluster-description-updated')
  })

  it('updates space db cluster', async () => {
    const dbCluster1 = {
      dxid: 'dbcluster-xxx1' as DxId<'dbcluster'>,
      name: 'db-cluster-1',
      project: 'project-xxx1',
      status: STATUS.STOPPED,
      scope: 'space-1',
      uid: 'dbcluster-xxx1-1' as Uid<'dbcluster'>,
    }

    findEditableOneStub.withArgs({ uid: dbCluster1.uid }).resolves(dbCluster1)
    transactionalStub.resolves({
      dxid: 'dbcluster-xxx1' as DxId<'dbcluster'>,
      name: 'db-cluster-updated',
      description: 'db-cluster-description-updated',
      project: 'project-xxx1',
      status: STATUS.STOPPED,
      scope: 'space-1',
      uid: 'dbcluster-xxx1-1' as Uid<'dbcluster'>,
    })

    const dbClusterUpdated = await getInstance().updateDbCluster(dbCluster1.uid, {
      name: 'db-cluster-updated',
      description: 'db-cluster-description-updated',
    })

    expect(dbClusterUpdated.dxid).eq('dbcluster-xxx1')
    expect(dbClusterUpdated.name).eq('db-cluster-updated')
    expect(dbClusterUpdated.description).eq('db-cluster-description-updated')
  })

  it('throws NotFoundError when db cluster not accessible', async () => {
    findEditableOneStub.withArgs({ uid: 'dbcluster-xxx1-1' }).resolves(null)

    await expect(
      getInstance().updateDbCluster('dbcluster-xxx1-1', {
        name: 'db-cluster-updated',
        description: 'db-cluster-description-updated',
      }),
    ).to.be.rejectedWith(NotFoundError, `DbCluster not found or not editable`)
  })

  function getInstance(): DbClusterUpdateFacade {
    const em = {
      transactional: transactionalStub,
    } as unknown as EntityManager
    const dbClusterRepo = {
      findEditableOne: findEditableOneStub,
    } as unknown as DbClusterRepository
    const notificationService = {} as unknown as NotificationService
    const dbClusterService = new DbClusterService(em, dbClusterRepo, userContext, notificationService)

    return new DbClusterUpdateFacade(dbClusterService, userContext)
  }
})
