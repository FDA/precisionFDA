import type { SqlEntityManager } from '@mikro-orm/mysql'
import { App } from '@shared/domain/app/app.entity'
import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'
import { expect } from 'chai'
import { stub } from 'sinon'
import { WorkflowService } from '../../../src/domain/workflow/service/workflow.service'

describe('WorkflowService', () => {
  const APP_1_UID = 'app 1 uid'
  const APP_1 = { uid: APP_1_UID }
  const STAGE_1 = { app_uid: APP_1_UID }

  const APP_2_UID = 'app 2 uid'
  const APP_2 = { uid: APP_2_UID }
  const STAGE_2 = { app_uid: APP_2_UID }

  const APP_UIDS = [APP_1_UID, APP_2_UID]
  const APPS = [APP_1, APP_2]
  const STAGES = [STAGE_1, STAGE_2]

  const WORKFLOW = {
    spec: {
      input_spec: {
        stages: STAGES,
      },
    },
  } as unknown as Workflow

  const findStub = stub()

  beforeEach(() => {
    findStub.reset()
    findStub.throws()
    findStub.withArgs(App, { uid: APP_UIDS }).resolves(APPS)
  })

  describe('#getApps', () => {
    it('should not catch error from find', async () => {
      const error = new Error('my error')
      findStub.reset()
      findStub.throws(error)

      await expect(getInstance().getApps(WORKFLOW)).to.be.rejectedWith(error)
    })

    it('should return empty array if no workflow provided', async () => {
      const res = await getInstance().getApps(null)

      expect(res).to.be.empty()
      expect(findStub.called).to.be.false()
    })

    it('should return empty array if provided workflow has no spec', async () => {
      const NO_SPEC_WORKFLOW = {} as unknown as Workflow

      const res = await getInstance().getApps(NO_SPEC_WORKFLOW)

      expect(res).to.be.empty()
      expect(findStub.called).to.be.false()
    })

    it('should return empty array if spec has no input_spec', async () => {
      const NO_INPUT_SPEC_WORKFLOW = { spec: {} } as unknown as Workflow

      const res = await getInstance().getApps(NO_INPUT_SPEC_WORKFLOW)

      expect(res).to.be.empty()
      expect(findStub.called).to.be.false()
    })

    it('should return empty array if spec has no input stages', async () => {
      const NO_INPUT_STAGES_WORKFLOW = { spec: { input_spec: {} } } as unknown as Workflow

      const res = await getInstance().getApps(NO_INPUT_STAGES_WORKFLOW)

      expect(res).to.be.empty()
      expect(findStub.called).to.be.false()
    })

    it('should return empty array if spec has empty input stages', async () => {
      const EMPTY_INPUT_STAGES_WORKFLOW = { spec: { input_spec: { stages: [] } } } as unknown as Workflow

      const res = await getInstance().getApps(EMPTY_INPUT_STAGES_WORKFLOW)

      expect(res).to.be.empty()
      expect(findStub.called).to.be.false()
    })

    it('should return both apps for valid workflow with input stages', async () => {
      const res = await getInstance().getApps(WORKFLOW)

      expect(res).to.have.length(2)
      expect(res).to.include(APP_1)
      expect(res).to.include(APP_2)
    })
  })

  function getInstance() {
    const em = {
      find: findStub,
    } as unknown as SqlEntityManager

    return new WorkflowService(em)
  }
})
