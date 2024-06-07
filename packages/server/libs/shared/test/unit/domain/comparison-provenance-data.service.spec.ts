import { SqlEntityManager } from '@mikro-orm/mysql'
import { COMPARISON_STATE, Comparison } from '@shared/domain/comparison/comparison.entity'
import { EntityService } from '@shared/domain/entity/entity.service'
import { ComparisonProvenanceDataService } from '@shared/domain/provenance/service/entity-data/comparison-provenance-data.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { PARENT_TYPE } from '@shared/domain/user-file/user-file.types'
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

  const OUTPUT_FILE_ID = 2
  const OUTPUT_FILE = { id: OUTPUT_FILE_ID }

  const loadFilesStub = stub()
  const getEntityUiLinkStub = stub()

  const nodeFindStub = stub()
  const getRepositoryStub = stub()

  const COMPARISON = {
    id: ID,
    name: NAME,
    inputFiles: { loadItems: loadFilesStub },
  } as unknown as Comparison

  let getEntityTypeForEntityStub: SinonStub

  beforeEach(() => {
    loadFilesStub.reset()
    loadFilesStub.resolves(FILES)

    getEntityUiLinkStub.reset()
    getEntityUiLinkStub.throws()
    getEntityUiLinkStub.withArgs(COMPARISON).resolves(LINK)
    nodeFindStub.reset()
    nodeFindStub.throws()
    nodeFindStub
      .withArgs({ parentType: PARENT_TYPE.COMPARISON, parentId: COMPARISON.id })
      .resolves([OUTPUT_FILE])

    getRepositoryStub.reset()
    getRepositoryStub.throws()
    getRepositoryStub.withArgs(UserFile).returns({ find: nodeFindStub })

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

  describe('#getChildren', () => {
    it('should return no children if comparison is not done', async () => {
      const res = await getInstance().getChildren({
        id: COMPARISON.id,
        state: COMPARISON_STATE.FAILED,
      } as unknown as Comparison)

      expect(res).to.be.an('array').and.to.be.empty()
    })

    it('should return output files as children', async () => {
      const res = await getInstance().getChildren({
        id: COMPARISON.id,
        state: COMPARISON_STATE.DONE,
      } as unknown as Comparison)

      expect(res).to.be.an('array').with.length(1)
      expect(res).to.deep.include({ type: 'file', entity: OUTPUT_FILE })
    })
  })

  function getInstance() {
    const em = {
      getRepository: getRepositoryStub,
    } as unknown as SqlEntityManager
    const entityService = { getEntityUiLink: getEntityUiLinkStub } as unknown as EntityService

    return new ComparisonProvenanceDataService(em, entityService)
  }
})
