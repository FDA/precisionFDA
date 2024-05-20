import { EntityService } from '@shared/domain/entity/entity.service'
import { UserProvenanceDataService } from '@shared/domain/provenance/service/entity-data/user-provenance-data.service'
import { User } from '@shared/domain/user/user.entity'
import { EntityUtils } from '@shared/utils/entity.utils'
import { expect } from 'chai'
import { SinonStub, stub } from 'sinon'

describe('UserProvenanceDataService', () => {
  const FULL_NAME = 'full name'
  const LINK = 'LINK'
  const DXUSER = 'DXUSER'

  const USER = { fullName: FULL_NAME, dxuser: DXUSER } as unknown as User

  const getEntityUiLinkStub = stub()

  let getEntityTypeForEntityStub: SinonStub

  beforeEach(() => {
    getEntityUiLinkStub.reset()
    getEntityUiLinkStub.throws()
    getEntityUiLinkStub.withArgs(USER).resolves(LINK)

    getEntityTypeForEntityStub = stub(EntityUtils, 'getEntityTypeForEntity').throws()
    getEntityTypeForEntityStub.withArgs(USER).returns('user')
  })

  afterEach(() => {
    getEntityTypeForEntityStub.restore()
  })

  describe('#getData', () => {
    it('should provide correct data about the user', async () => {
      const res = await getInstance().getData(USER)

      expect(res).to.deep.equal({ type: 'user', url: LINK, title: FULL_NAME, identifier: DXUSER })
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

    return new UserProvenanceDataService(entityService)
  }
})
