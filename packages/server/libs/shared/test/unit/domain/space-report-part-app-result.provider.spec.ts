import { App } from '@shared/domain/app/app.entity'
import { EntityProvenanceService } from '@shared/domain/provenance/service/entity-provenance.service'
import { SpaceReportPartAppResultProvider } from '@shared/facade/space-report/service/space-report-part-app-result-provider.service'
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
  const PROVENANCE_RAW = 'provenance raw'

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
      .withArgs(
        {
          type: 'app',
          entity: APP,
        },
        'raw',
      )
      .resolves(PROVENANCE_RAW)
  })

  describe('provide HTML', () => {
    it('should provide correct result', async () => {
      const res = await getInstance().getResult(APP, null, 'HTML')

      assertCorrectResult(res, { svg: PROVENANCE_SVG })
    })

    it('should provide app title as title if no revision', async () => {
      await assertNoRevisionTitle('HTML', 'svg', { omitStyles: true }, PROVENANCE_SVG)
    })
  })

  describe('provide JSON', () => {
    it('should provide correct result', async () => {
      const res = await getInstance().getResult(APP, null, 'JSON')

      assertCorrectResult(res, { provenance: PROVENANCE_RAW })
    })

    it('should provide app title as title if no revision', async () => {
      await assertNoRevisionTitle('JSON', 'raw', undefined, PROVENANCE_RAW)
    })
  })

  function assertCorrectResult(actual, expected) {
    expect(actual).to.deep.equal({
      title: `${TITLE} (revision ${REVISION})`,
      created: CREATED,
      ...expected,
    })
  }

  async function assertNoRevisionTitle(
    reportFormat,
    provenanceFormat,
    provenanceOptions,
    provenanceResult,
  ) {
    const APP_NO_REVISION = {
      title: TITLE,
      revision: null,
      createdAt: CREATED,
    } as unknown as App

    const provenanceArgs = [
      {
        type: 'app',
        entity: APP_NO_REVISION,
      },
      provenanceFormat,
    ]

    if (provenanceOptions) {
      provenanceArgs.push(provenanceOptions)
    }

    getEntityProvenanceStub.reset()
    getEntityProvenanceStub.throws()
    getEntityProvenanceStub.withArgs(...provenanceArgs).resolves(provenanceResult)

    const res = await getInstance().getResult(APP_NO_REVISION, null, reportFormat)

    expect(res.title).to.eq(TITLE)
  }

  function getInstance() {
    const entityProvenanceService = {
      getEntityProvenance: getEntityProvenanceStub,
    } as unknown as EntityProvenanceService

    return new SpaceReportPartAppResultProvider(entityProvenanceService)
  }
})
