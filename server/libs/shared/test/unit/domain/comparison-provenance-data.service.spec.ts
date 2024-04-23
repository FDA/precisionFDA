import { Comparison } from '@shared/domain/comparison/comparison.entity'
import { EntityService } from '@shared/domain/entity/entity.service'
import { ComparisonProvenanceDataService } from '@shared/domain/provenance/service/entity-data/comparison-provenance-data.service'
import { EntityUtils } from '@shared/utils/entity.utils'
import { expect } from 'chai'
import { SinonStub, stub } from 'sinon'

describe('ComparisonProvenanceDataService', () => {
  const ID = 1

  const NAME = 'name'
  const LINK = 'LINK'

  const FILE_1_ID = 10
  const FILE_2_ID = 11

  const FILE_1 = { id: FILE_1_ID }
  const FILE_2 = { id: FILE_2_ID }
  const FILES = [FILE_1, FILE_2]

  const loadFilesStub = stub()
  const getEntityLinkStub = stub()

  const COMPARISON = {
    id: ID,
    name: NAME,
    inputFiles: { loadItems: loadFilesStub },
  } as unknown as Comparison

  let getEntityTypeForEntityStub: SinonStub

  beforeEach(() => {
    loadFilesStub.reset()
    loadFilesStub.resolves(FILES)

    getEntityLinkStub.reset()
    getEntityLinkStub.throws()
    getEntityLinkStub.withArgs(COMPARISON).resolves(LINK)

    getEntityTypeForEntityStub = stub(EntityUtils, 'getEntityTypeForEntity').throws()
    getEntityTypeForEntityStub.withArgs(COMPARISON).returns('comparison')
  })

  afterEach(() => {
    getEntityTypeForEntityStub.restore()
  })

  describe('#getData', () => {
    it('should provide correct data about the comparison', async () => {
      const res = await getInstance().getData(COMPARISON)

      expect(res).to.deep.equal({
        type: 'comparison',
        url: LINK,
        title: NAME,
        identifier: String(ID),
      })
    })
  })

  describe('#getParents', () => {
    it('should return no parents if no input files', async () => {
      loadFilesStub.reset()
      loadFilesStub.resolves([])

      const res = await getInstance().getParents(COMPARISON)

      expect(res).to.be.an('array').and.to.be.empty()
    })

    it('should return input files as parents', async () => {
      const res = await getInstance().getParents(COMPARISON)

      expect(res).to.be.an('array').with.length(2)
      expect(res).to.deep.include({ type: 'file', entity: FILE_1 })
      expect(res).to.deep.include({ type: 'file', entity: FILE_2 })
    })
  })

  function getInstance() {
    const entityService = { getEntityLink: getEntityLinkStub } as unknown as EntityService

    return new ComparisonProvenanceDataService(entityService)
  }
})
