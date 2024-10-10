import { SyncJobOperation } from '@shared/domain/job/ops/synchronize'
import { expect } from 'chai'

describe('SyncJobOperation BullJobId', () => {
  it('creates correct bullJob ids', async () => {
    const jobDxid = 'job-1234567'
    const bullJobId = SyncJobOperation.getBullJobId(jobDxid)
    expect(bullJobId).to.equal('sync_job_status.job-1234567')
  })

  it('parses bullJob ids correctly', async () => {
    const bullJobId = 'sync_job_status.job-G9jb79Q0qp9yX9G51fykB5VP'
    const jobDxid = SyncJobOperation.getJobDxidFromBullJobId(bullJobId)
    expect(jobDxid).to.equal('job-G9jb79Q0qp9yX9G51fykB5VP')
  })
})
