import { EntityProvenanceService } from '@shared/domain/provenance/service/entity-provenance.service'
import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'
import { SpaceReportPartWorkflowResultProvider } from '@shared/facade/space-report/service/space-report-part-workflow-result-provider.service'
import { expect } from 'chai'
import { stub } from 'sinon'

describe('SpaceReportPartWorkflowResultProvider', () => {
  const NAME = 'name'
  const CREATED = 'created'

  const WORKFLOW = {
    name: NAME,
    createdAt: CREATED,
  } as unknown as Workflow

  const PROVENANCE_SVG = 'provenance svg'
  const PROVENANCE_RAW = 'provenance raw'

  const getEntityProvenanceStub = stub()

  beforeEach(() => {
    getEntityProvenanceStub.reset()
    getEntityProvenanceStub.throws()
    getEntityProvenanceStub
      .withArgs(
        {
          type: 'workflow',
          entity: WORKFLOW,
        },
        'svg',
        { omitStyles: true },
      )
      .resolves(PROVENANCE_SVG)
      .withArgs(
        {
          type: 'workflow',
          entity: WORKFLOW,
        },
        'raw',
      )
      .resolves(PROVENANCE_RAW)
  })

  it('should provide correct HTML result', async () => {
    const res = await getInstance().getResult(WORKFLOW, null, 'HTML')

    expect(res).to.deep.equal({ title: NAME, created: CREATED, svg: PROVENANCE_SVG })
  })

  it('should provide correct JSON result', async () => {
    const res = await getInstance().getResult(WORKFLOW, null, 'JSON')

    expect(res).to.deep.equal({ title: NAME, created: CREATED, provenance: PROVENANCE_RAW })
  })

  function getInstance() {
    const entityProvenanceService = {
      getEntityProvenance: getEntityProvenanceStub,
    } as unknown as EntityProvenanceService

    return new SpaceReportPartWorkflowResultProvider(entityProvenanceService)
  }
})
