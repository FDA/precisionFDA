import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'
import { expect } from 'chai'
import { stub } from 'sinon'
import {
  WorkflowProvenanceDataService,
} from '../../../src/domain/provenance/service/entity-data/workflow-provenance-data.service'
import { WorkflowService } from '../../../src/domain/workflow/service/workflow.service'

describe('WorkflowProvenanceDataService', () => {
  const TITLE = 'title'
  const UID = 'uid'

  const APP_1_ID = 1
  const APP_1 = { id: APP_1_ID }

  const APP_2_ID = 2
  const APP_2 = { id: APP_2_ID }

  const APPS = [APP_1, APP_2]

  const WORKFLOW = {
    title: TITLE,
    uid: UID,
  } as unknown as Workflow

  const getAppsStub = stub()

  beforeEach(() => {
    getAppsStub.reset()
    getAppsStub.throws()
    getAppsStub.withArgs(WORKFLOW).resolves(APPS)
  })

  describe('#getData', () => {
    it('should provide correct data about the workflow', () => {
      const res = getInstance().getData(WORKFLOW)

      expect(res).to.deep.equal({ type: 'workflow', url: `https://rails-host:1234/home/workflows/${UID}`, title: TITLE })
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

    return new WorkflowProvenanceDataService(workflowService)
  }
})
