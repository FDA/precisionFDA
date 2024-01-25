import { Asset } from '@shared/domain/user-file/asset.entity'
import { expect } from 'chai'
import {
  AssetProvenanceDataService,
} from '../../../src/domain/provenance/service/entity-data/asset-provenance-data.service'

describe('AssetProvenanceDataService', () => {
  const NAME = 'name'
  const UID = 'uid'

  const ASSET = {
    name: NAME,
    uid: UID,
  } as unknown as Asset

  describe('#getData', () => {
    it('should provide correct data about the asset', () => {
      const res = getInstance().getData(ASSET)

      expect(res).to.deep.equal({ type: 'asset', url: `https://rails-host:1234/home/assets/${UID}`, title: NAME })
    })
  })

  describe('#getParents', () => {
    it('should return no parents', async () => {
      const res = await getInstance().getParents()

      expect(res).to.be.an('array').and.to.be.empty()
    })
  })

  function getInstance() {
    return new AssetProvenanceDataService()
  }
})
