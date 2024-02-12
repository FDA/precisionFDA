import { App } from '@shared/domain/app/app.entity'
import { expect } from 'chai'
import { stub } from 'sinon'
import {
  AppProvenanceDataService,
} from '../../../src/domain/provenance/service/entity-data/app-provenance-data.service'

describe('AppProvenanceDataService', () => {
  const TITLE = 'title'
  const REVISION = 'revision'
  const UID = 'uid'

  const ASSET_1_ID = 0
  const ASSET_2_ID = 1

  const ASSET_1 = { id: ASSET_1_ID }
  const ASSET_2 = { id: ASSET_2_ID }
  const ASSETS = [ASSET_1, ASSET_2]

  const loadAssetsStub = stub()

  const APP = {
    title: TITLE,
    revision: REVISION,
    uid: UID,
    assets: { loadItems: loadAssetsStub },
  } as unknown as App

  beforeEach(() => {
    loadAssetsStub.reset()
    loadAssetsStub.resolves(ASSETS)
  })

  describe('#getData', () => {
    it('should provide correct data about the app', () => {
      const res = getInstance().getData(APP)

      expect(res).to.deep.equal({ type: 'app', url: `https://rails-host:1234/home/apps/${UID}`, title: `${TITLE} (revision ${REVISION})` })
    })

    it('should provide app title as title if no revision', () => {
      const res = getInstance().getData({ ...APP, revision: null })

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
    return new AppProvenanceDataService()
  }
})
