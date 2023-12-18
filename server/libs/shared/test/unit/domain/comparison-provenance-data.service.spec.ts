import { expect } from 'chai'
import { stub } from 'sinon'
import { Comparison } from '../../../src/domain'
import {
  ComparisonProvenanceDataService,
} from '../../../src/domain/provenance/service/entity-data/comparison-provenance-data.service'

describe('ComparisonProvenanceDataService', () => {
  const NAME = 'name'
  const ID = 0

  const FILE_1_ID = 10
  const FILE_2_ID = 11

  const FILE_1 = { id: FILE_1_ID }
  const FILE_2 = { id: FILE_2_ID }
  const FILES = [FILE_1, FILE_2]

  const loadFilesStub = stub()

  const COMPARISON = {
    id: ID,
    name: NAME,
    inputFiles: { loadItems: loadFilesStub },
  } as unknown as Comparison

  beforeEach(() => {
    loadFilesStub.reset()
    loadFilesStub.resolves(FILES)
  })

  describe('#getData', () => {
    it('should provide correct data about the comparison', () => {
      const res = getInstance().getData(COMPARISON)

      expect(res).to.deep.equal({ type: 'comparison', url: `https://rails-host:1234/comparisons/${ID}`, title: NAME })
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
    return new ComparisonProvenanceDataService()
  }
})
