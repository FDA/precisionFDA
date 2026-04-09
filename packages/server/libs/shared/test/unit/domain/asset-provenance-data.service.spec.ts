import { expect } from 'chai'
import { SinonStub, stub } from 'sinon'
import { EntityService } from '@shared/domain/entity/entity.service'
import { AssetProvenanceDataService } from '@shared/domain/provenance/service/entity-data/asset-provenance-data.service'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { EntityUtils } from '@shared/utils/entity.utils'

describe('AssetProvenanceDataService', () => {
  const NAME = 'name'
  const LINK = 'LINK'
  const UID = 'UID'

  const ASSET = { name: NAME, uid: UID, scope: STATIC_SCOPE.PRIVATE } as unknown as Asset

  const getEntityUiLinkStub = stub()

  let getEntityTypeForEntityStub: SinonStub

  beforeEach(() => {
    getEntityUiLinkStub.reset()
    getEntityUiLinkStub.throws()
    getEntityUiLinkStub.withArgs(ASSET).resolves(LINK)

    getEntityTypeForEntityStub = stub(EntityUtils, 'getEntityTypeForEntity').throws()
    getEntityTypeForEntityStub.withArgs(ASSET).returns('asset')
  })

  afterEach(() => {
    getEntityTypeForEntityStub.restore()
  })

  describe('#getData', () => {
    it('should provide correct data about the asset', async () => {
      const res = await getInstance().getData(ASSET)

      expect(res).to.deep.equal({
        type: 'asset',
        url: LINK,
        title: NAME,
        identifier: UID,
        scope: STATIC_SCOPE.PRIVATE,
      })
    })
  })

  describe('#getParents', () => {
    it('should return no parents', async () => {
      const res = await getInstance().getParents()

      expect(res).to.be.an('array').and.to.be.empty()
    })
  })

  function getInstance() {
    const entityService = { getEntityUiLink: getEntityUiLinkStub } as unknown as EntityService

    return new AssetProvenanceDataService(entityService)
  }
})
