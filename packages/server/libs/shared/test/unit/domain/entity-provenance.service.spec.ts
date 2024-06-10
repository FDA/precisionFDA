import { App } from '@shared/domain/app/app.entity'
import { EntityProvenance } from '@shared/domain/provenance/model/entity-provenance'
import { EntityProvenanceData } from '@shared/domain/provenance/model/entity-provenance-data'
import { EntityProvenanceSourceUnion } from '@shared/domain/provenance/model/entity-provenance-source-union'
import { EntityProvenanceSvgOptions } from '@shared/domain/provenance/model/entity-provenance-svg-options'
import { EntityProvenanceDataProviderService } from '@shared/domain/provenance/service/entity-data/entity-provenance-data-provider.service'
import { EntityProvenanceService } from '@shared/domain/provenance/service/entity-provenance.service'
import { EntityProvenanceSvgResultTransformerService } from '@shared/domain/provenance/service/result-transform/entity-provenance-svg-result-transformer.service'
import { expect } from 'chai'
import { stub } from 'sinon'

describe('EntityProvenanceService', () => {
  const ENTITY_TYPE = 'app'
  const APP_ID = 0
  const APP = { id: APP_ID } as unknown as App
  const ENTITY_PROVENANCE_SOURCE: EntityProvenanceSourceUnion = { type: ENTITY_TYPE, entity: APP }

  const TITLE = 'title'
  const URL = 'url'
  const ENTITY_PROVENANCE: EntityProvenance = {
    data: {
      title: TITLE,
      url: URL,
      type: ENTITY_TYPE,
    } as unknown as EntityProvenanceData<'app'>,
  }

  const SVG = 'svg'
  const STYLES = 'styles'

  const getDataStub = stub()
  const svgTransformStub = stub()
  const getStylesStub = stub()

  beforeEach(() => {
    getDataStub.reset()
    getDataStub.throws()
    getDataStub.withArgs(ENTITY_PROVENANCE_SOURCE).resolves(ENTITY_PROVENANCE)

    svgTransformStub.reset()
    svgTransformStub.throws()
    svgTransformStub.withArgs(ENTITY_PROVENANCE).resolves(SVG)

    getStylesStub.reset()
    getStylesStub.resolves(STYLES)
  })

  describe('#getEntityProvenance', () => {
    it('should not catch error from getEntityProvenanceData', async () => {
      const error = new Error('my error')
      getDataStub.reset()
      getDataStub.throws(error)

      await expect(
        getInstance().getEntityProvenance(ENTITY_PROVENANCE_SOURCE, 'raw'),
      ).to.be.rejectedWith(error)
    })

    it('should not catch error from svgTransform', async () => {
      const error = new Error('my error')
      svgTransformStub.reset()
      svgTransformStub.throws(error)

      await expect(
        getInstance().getEntityProvenance(ENTITY_PROVENANCE_SOURCE, 'svg'),
      ).to.be.rejectedWith(error)
    })

    it('should return the provenance data when format is raw', async () => {
      const res = await getInstance().getEntityProvenance(ENTITY_PROVENANCE_SOURCE, 'raw')

      expect(res).to.equal(ENTITY_PROVENANCE)
    })

    it('should return the transformed svg when format is svg', async () => {
      const res = await getInstance().getEntityProvenance(ENTITY_PROVENANCE_SOURCE, 'svg')

      expect(res).to.equal(SVG)
    })

    it('should pass the correct options to transformer', async () => {
      const OPTIONS = {} as unknown as EntityProvenanceSvgOptions
      const OPTIONED_SVG = 'optioned svg'
      svgTransformStub.withArgs(ENTITY_PROVENANCE, OPTIONS).resolves(OPTIONED_SVG)

      const res = await getInstance().getEntityProvenance(ENTITY_PROVENANCE_SOURCE, 'svg', OPTIONS)

      expect(res).to.eq(OPTIONED_SVG)
    })
  })

  describe('#getStyles', () => {
    it('should not catch error from getStyles', async () => {
      const error = new Error('my error')
      getStylesStub.reset()
      getStylesStub.throws(error)

      await expect(getInstance().getSvgStyles()).to.be.rejectedWith(error)
    })

    it('proxy getStyles call', async () => {
      const res = await getInstance().getSvgStyles()

      expect(res).to.be.eq(STYLES)
    })
  })

  function getInstance() {
    const entityProvenanceDataProviderService = {
      getData: getDataStub,
    } as unknown as EntityProvenanceDataProviderService

    const entityProvenanceSvgResultTransformerService = {
      transform: svgTransformStub,
      getStyles: getStylesStub,
    } as unknown as EntityProvenanceSvgResultTransformerService

    return new EntityProvenanceService(
      entityProvenanceDataProviderService,
      entityProvenanceSvgResultTransformerService,
    )
  }
})
