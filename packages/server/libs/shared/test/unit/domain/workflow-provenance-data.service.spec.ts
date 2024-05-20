import { EntityService } from '@shared/domain/entity/entity.service'
import { WorkflowProvenanceDataService } from '@shared/domain/provenance/service/entity-data/workflow-provenance-data.service'
import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'
import { WorkflowService } from '@shared/domain/workflow/service/workflow.service'
import { EntityUtils } from '@shared/utils/entity.utils'
import { expect } from 'chai'
import { SinonStub, stub } from 'sinon'

describe('WorkflowProvenanceDataService', () => {
  const TITLE = 'title'
  const LINK = 'LINK'

  const APP_1_ID = 1
  const APP_1 = { id: APP_1_ID }

  const APP_2_ID = 2
  const APP_2 = { id: APP_2_ID }

  const APPS = [APP_1, APP_2]

  const UID = 'UID'

  const WORKFLOW = { title: TITLE, uid: UID } as unknown as Workflow

  const getAppsStub = stub()
  const getEntityUiLinkStub = stub()

  let getEntityTypeForEntityStub: SinonStub

  beforeEach(() => {
    getAppsStub.reset()
    getAppsStub.throws()
    getAppsStub.withArgs(WORKFLOW).resolves(APPS)

    getEntityUiLinkStub.reset()
    getEntityUiLinkStub.throws()
    getEntityUiLinkStub.withArgs(WORKFLOW).resolves(LINK)

    getEntityTypeForEntityStub = stub(EntityUtils, 'getEntityTypeForEntity').throws()
    getEntityTypeForEntityStub.withArgs(WORKFLOW).returns('workflow')
  })

  afterEach(() => {
    getEntityTypeForEntityStub.restore()
  })

  describe('#getData', () => {
    it('should provide correct data about the workflow', async () => {
      const res = await getInstance().getData(WORKFLOW)

      expect(res).to.deep.equal({
        type: 'workflow',
        url: LINK,
        title: TITLE,
        identifier: UID,
      })
    })
  })

  describe('#getParents', () => {
    it('should return no parents if no apps', async () => {
      getAppsStub.reset()
      getAppsStub.withArgs(WORKFLOW).resolves([])

      const res = await getInstance().getParents(WORKFLOW)

      expect(res).to.be.an('array').and.to.be.empty()
    })

    it('should return apps as parents', async () => {
      const res = await getInstance().getParents(WORKFLOW)

      expect(res).to.be.an('array').with.length(2)
      expect(res).to.deep.include({ type: 'app', entity: APP_1 })
      expect(res).to.deep.include({ type: 'app', entity: APP_2 })
    })
  })

  function getInstance() {
    const workflowService = { getApps: getAppsStub } as unknown as WorkflowService
    const entityService = { getEntityUiLink: getEntityUiLinkStub } as unknown as EntityService

    return new WorkflowProvenanceDataService(workflowService, entityService)
  }
})
