import { Job } from '@shared/domain/job/job.entity'
import { EntityProvenanceService } from '@shared/domain/provenance/service/entity-provenance.service'
import { SpaceReportPartJobResultProvider } from '@shared/facade/space-report/service/space-report-part-job-result-provider.service'
import { expect } from 'chai'
import { stub } from 'sinon'

describe('SpaceReportPartJobResultProvider', () => {
  const NAME = 'name'
  const CREATED = 'created'

  const JOB = {
    name: NAME,
    createdAt: CREATED,
  } as unknown as Job

  const PROVENANCE_SVG = 'provenance svg'
  const PROVENANCE_RAW = 'provenance raw'

  const getEntityProvenanceStub = stub()

  beforeEach(() => {
    getEntityProvenanceStub.reset()
    getEntityProvenanceStub.throws()
    getEntityProvenanceStub
      .withArgs(
        {
          type: 'job',
          entity: JOB,
        },
        'svg',
        { omitStyles: true },
      )
      .resolves(PROVENANCE_SVG)
      .withArgs(
        {
          type: 'job',
          entity: JOB,
        },
        'raw',
      )
      .resolves(PROVENANCE_RAW)
  })

  it('should provide correct HTML result', async () => {
    const res = await getInstance().getResult(JOB, null, 'HTML')

    expect(res).to.deep.equal({ title: NAME, created: CREATED, svg: PROVENANCE_SVG })
  })

  it('should provide correct JSON result', async () => {
    const res = await getInstance().getResult(JOB, null, 'JSON')

    expect(res).to.deep.equal({ title: NAME, created: CREATED, provenance: PROVENANCE_RAW })
  })

  function getInstance() {
    const entityProvenanceService = {
      getEntityProvenance: getEntityProvenanceStub,
    } as unknown as EntityProvenanceService

    return new SpaceReportPartJobResultProvider(entityProvenanceService)
  }
})
