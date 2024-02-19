import { App } from '@shared/domain/app/app.entity'
import { EntityProvenanceService } from '@shared/domain/provenance/service/entity-provenance.service'
import { SpaceReportPartAppResultProvider } from '@shared/facade/space-report-batch/service/space-report-part-app-result-provider.service'
import { expect } from 'chai'
import { stub } from 'sinon'

describe('SpaceReportPartAppResultProvider', () => {
  const TITLE = 'title'
  const REVISION = 'revision'
  const CREATED = 'created'

  const APP = {
    title: TITLE,
    revision: REVISION,
    createdAt: CREATED,
  } as unknown as App

  const PROVENANCE_SVG = 'provenance svg'

  const getEntityProvenanceStub = stub()

  beforeEach(() => {
    getEntityProvenanceStub.reset()
    getEntityProvenanceStub.throws()
    getEntityProvenanceStub
      .withArgs(
        {
          type: 'app',
          entity: APP,
        },
        'svg',
        { omitStyles: true },
      )
      .resolves(PROVENANCE_SVG)
  })

  it('should provide correct result', async () => {
    const res = await getInstance().getResult(APP)

    expect(res).to.deep.equal({
      title: `${TITLE} (revision ${REVISION})`,
      created: CREATED,
      svg: PROVENANCE_SVG,
    })
  })

  it('should provide app title as title if no revision', async () => {
    const APP_NO_REVISION = {
      title: TITLE,
      revision: null,
      createdAt: CREATED,
    } as unknown as App

    getEntityProvenanceStub.reset()
    getEntityProvenanceStub.throws()
    getEntityProvenanceStub
      .withArgs(
        {
          type: 'app',
          entity: APP_NO_REVISION,
        },
        'svg',
        { omitStyles: true },
      )
      .resolves(PROVENANCE_SVG)

    const res = await getInstance().getResult(APP_NO_REVISION)

    expect(res.title).to.eq(TITLE)
  })

  function getInstance() {
    const entityProvenanceService = {
      getEntityProvenance: getEntityProvenanceStub,
    } as unknown as EntityProvenanceService

    return new SpaceReportPartAppResultProvider(entityProvenanceService)
  }
})
