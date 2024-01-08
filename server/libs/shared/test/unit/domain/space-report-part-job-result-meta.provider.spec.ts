import { Job } from '@shared/domain/job/job.entity'
import { expect } from 'chai'
import {
  SpaceReportPartJobResultMetaProvider,
} from '../../../src/domain/space-report/service/part/space-report-part-job-result-meta.provider'

describe('SpaceReportPartJobResultMetaProvider', () => {
  const NAME = 'name'
  const CREATED = 'created'

  const JOB = {
    name: NAME,
    createdAt: CREATED,
  } as unknown as Job

  it('should provide correct meta', () => {
    const res = getInstance().getResultMeta(JOB)

    expect(res).to.deep.equal({ title: NAME, created: CREATED })
  })

  function getInstance() {
    return new SpaceReportPartJobResultMetaProvider()
  }
})
