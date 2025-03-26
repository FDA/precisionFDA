import { App } from '@shared/domain/app/app.entity'
import { Comparison } from '@shared/domain/comparison/comparison.entity'
import { EntityFetcherService } from '@shared/domain/entity/entity-fetcher.service'
import { EntityProvenanceService } from '@shared/domain/provenance/service/entity-provenance.service'
import { STATIC_SCOPE } from '@shared/enums'
import { PublishApiFacade } from 'apps/api/src/facade/publish/publish.facade'
import { expect } from 'chai'
import { stub } from 'sinon'

describe('PublishApiFacade', () => {
  const FILE_UID = 'file-uid-1'
  const COMPARISON_ID = `comparison-1`
  const USER_ID = 'user-1'
  const APP_UID = 'app-uid-1'
  const ASSET_UID = 'file-uid-2'

  const getEntityProvenanceStub = stub().resolves()
  const getAccessibleByUidStub = stub().resolves()
  const getAccessibleByIdStub = stub().resolves()

  beforeEach(() => {
    getEntityProvenanceStub.reset()
    getAccessibleByUidStub.reset()
    getAccessibleByIdStub.reset()
  })

  it('should raise error if entity not found', async () => {
    getAccessibleByUidStub.resolves(null)
    await expect(getInstance().getPublishedTreeRoot(FILE_UID, 'file')).to.be.rejected

    getAccessibleByIdStub.resolves(null)
    await expect(getInstance().getPublishedTreeRoot(COMPARISON_ID, 'comparison')).to.be.rejected
  })

  it('should raise error if entity is not publishable', async () => {
    const file = { id: 1, isPublishable: () => false } as unknown as File
    getAccessibleByUidStub.resolves(file)
    await expect(getInstance().getPublishedTreeRoot(FILE_UID, 'file')).to.be.rejected

    const comparison = { id: 1, isPublishable: () => false } as unknown as Comparison
    getAccessibleByIdStub.resolves(comparison)
    await expect(getInstance().getPublishedTreeRoot(COMPARISON_ID, 'comparison')).to.be.rejected
  })

  it('should return tree root if entity is publishable', async () => {
    const app = { uid: APP_UID, isPublishable: () => true } as unknown as App
    const appTreeRoot = {
      data: {
        type: 'app',
        title: 'app',
        url: 'app-url',
        identifier: APP_UID,
        scope: STATIC_SCOPE.PRIVATE,
      },
      parents: [
        {
          data: {
            type: 'asset',
            title: 'file',
            url: 'file-url',
            identifier: ASSET_UID,
            scope: STATIC_SCOPE.PRIVATE,
          },
        },
      ],
    }
    getAccessibleByUidStub.resolves(app)
    getEntityProvenanceStub.resolves(appTreeRoot)

    const res = await getInstance().getPublishedTreeRoot(APP_UID, 'app')
    expect(res).to.deep.equal(appTreeRoot)
  })

  it('should skip the user in the entity provenance', async () => {
    const file = { id: 1, isPublishable: () => true } as unknown as File
    const fileTreeRoot = {
      data: {
        type: 'file',
        title: 'file',
        url: 'file-url',
        identifier: FILE_UID,
        scope: STATIC_SCOPE.PRIVATE,
      },
      parents: [
        {
          data: {
            type: 'user',
            title: 'user',
            url: 'user-url',
            identifier: USER_ID,
            scope: null,
          },
        },
      ],
    }
    getAccessibleByUidStub.resolves(file)
    getEntityProvenanceStub.resolves(fileTreeRoot)

    const res = await getInstance().getPublishedTreeRoot(FILE_UID, 'file')
    expect(res).to.deep.equal({
      data: {
        type: 'file',
        title: 'file',
        url: 'file-url',
        identifier: FILE_UID,
        scope: STATIC_SCOPE.PRIVATE,
      },
      parents: [],
    })
  })

  function getInstance() {
    const entityProvenanceService = {
      getEntityProvenance: getEntityProvenanceStub,
    } as unknown as EntityProvenanceService
    const entityFetcherService = {
      getAccessibleByUid: getAccessibleByUidStub,
      getAccessibleById: getAccessibleByIdStub,
    } as unknown as EntityFetcherService

    return new PublishApiFacade(entityProvenanceService, entityFetcherService)
  }
})
