import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'
import { expect } from 'chai'
import {
  SpaceReportPartWorkflowResultMetaProvider,
} from '../../../src/domain/space-report/service/part/space-report-part-workflow-result-meta.provider'

describe('SpaceReportPartWorkflowResultMetaProvider', () => {
  const NAME = 'name'
  const CREATED = 'created'

  const WORKFLOW = {
    name: NAME,
    createdAt: CREATED,
  } as unknown as Workflow

  it('should provide correct meta', () => {
    const res = getInstance().getResultMeta(WORKFLOW)

    expect(res).to.deep.equal({ title: NAME, created: CREATED })
  })

  function getInstance() {
    return new SpaceReportPartWorkflowResultMetaProvider()
  }
})
