import { App } from '@shared/domain/app/app.entity'
import { EntityService } from '@shared/domain/entity/entity.service'
import { AppProvenanceDataService } from '@shared/domain/provenance/service/entity-data/app-provenance-data.service'
import { EntityUtils } from '@shared/utils/entity.utils'
import { expect } from 'chai'
import { SinonStub, stub } from 'sinon'

describe('AppProvenanceDataService', () => {
  const TITLE = 'title'
  const REVISION = 'revision'
  const LINK = 'LINK'
  const UID = 'UID'

  const ASSET_1_ID = 0
  const ASSET_2_ID = 1

  const ASSET_1 = { id: ASSET_1_ID }
  const ASSET_2 = { id: ASSET_2_ID }
  const ASSETS = [ASSET_1, ASSET_2]

  const loadAssetsStub = stub()
  const getEntityUiLinkStub = stub()

  const APP = {
    title: TITLE,
    revision: REVISION,
    assets: { loadItems: loadAssetsStub },
    uid: UID,
  } as unknown as App

  let getEntityTypeForEntityStub: SinonStub

  beforeEach(() => {
    loadAssetsStub.reset()
    loadAssetsStub.resolves(ASSETS)

    getEntityUiLinkStub.reset()
    getEntityUiLinkStub.throws()
    getEntityUiLinkStub.withArgs(APP).resolves(LINK)

    getEntityTypeForEntityStub = stub(EntityUtils, 'getEntityTypeForEntity').throws()
    getEntityTypeForEntityStub.withArgs(APP).returns('app')
  })

  afterEach(() => {
    getEntityTypeForEntityStub.restore()
  })

  describe('#getData', () => {
    it('should provide correct data about the app', async () => {
      const res = await getInstance().getData(APP)

      expect(res).to.deep.equal({
        type: 'app',
        url: LINK,
        title: `${TITLE} (revision ${REVISION})`,
        identifier: UID,
      })
    })

    it('should provide app title as title if no revision', async () => {
      const NO_REVISION_APP = { ...APP, revision: null } as unknown as App

      getEntityTypeForEntityStub.withArgs(NO_REVISION_APP).returns('app')
      getEntityUiLinkStub.withArgs(NO_REVISION_APP).resolves(LINK)

      const res = await getInstance().getData(NO_REVISION_APP)

      expect(res.title).to.eq(TITLE)
    })
  })

  describe('#getParents', () => {
    it('should return no parents if no assets', async () => {
      loadAssetsStub.reset()
      loadAssetsStub.resolves([])

      const res = await getInstance().getParents(APP)

      expect(res).to.be.an('array').and.to.be.empty()
    })

    it('should return assets as parents of the app', async () => {
      const res = await getInstance().getParents(APP)

      expect(res).to.be.an('array').with.length(2)
      expect(res).to.deep.include({ type: 'asset', entity: ASSET_1 })
      expect(res).to.deep.include({ type: 'asset', entity: ASSET_2 })
    })
  })

  function getInstance() {
    const entityService = { getEntityUiLink: getEntityUiLinkStub } as unknown as EntityService
    return new AppProvenanceDataService(entityService)
  }
})
