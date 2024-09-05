import { EntityProvenanceService } from '@shared/domain/provenance/service/entity-provenance.service'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { SpaceReportPartAssetResultProvider } from '@shared/facade/space-report/service/space-report-part-asset-result-provider.service'
import { expect } from 'chai'
import { stub } from 'sinon'

describe('SpaceReportPartAssetResultProvider', () => {
  const NAME = 'name'
  const CREATED = 'created'

  const ASSET = {
    name: NAME,
    createdAt: CREATED,
  } as unknown as Asset

  const PROVENANCE_SVG = 'provenance svg'
  const PROVENANCE_RAW = 'provenance raw'

  const getEntityProvenanceStub = stub()

  beforeEach(() => {
    getEntityProvenanceStub.reset()
    getEntityProvenanceStub.throws()
    getEntityProvenanceStub
      .withArgs(
        {
          type: 'asset',
          entity: ASSET,
        },
        'svg',
        { omitStyles: true },
      )
      .resolves(PROVENANCE_SVG)
      .withArgs(
        {
          type: 'asset',
          entity: ASSET,
        },
        'raw',
      )
      .resolves(PROVENANCE_RAW)
  })

  it('should provide correct HTML result', async () => {
    const res = await getInstance().getResult(ASSET, null, 'HTML')

    expect(res).to.deep.equal({ title: NAME, created: CREATED, svg: PROVENANCE_SVG })
  })

  it('should provide correct JSON result', async () => {
    const res = await getInstance().getResult(ASSET, null, 'JSON')

    expect(res).to.deep.equal({ title: NAME, created: CREATED, provenance: PROVENANCE_RAW })
  })

  function getInstance() {
    const entityProvenanceService = {
      getEntityProvenance: getEntityProvenanceStub,
    } as unknown as EntityProvenanceService

    return new SpaceReportPartAssetResultProvider(entityProvenanceService)
  }
})
