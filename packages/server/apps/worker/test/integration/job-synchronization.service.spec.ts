import { expect } from 'chai'
import { JobSynchronizationService } from '@shared/domain/job/services/job-synchronization.service'

/**
 * This is former test for SyncJobOperation, but it tested only generation of ids.
 *
 * It needs to include tests for other functionality in JobSynchronizationService as well.
 */
describe('JobSynchronizationService BullJobId', () => {
  it('creates correct bullJob ids', async () => {
    const jobDxid = 'job-1234567'
    const bullJobId = JobSynchronizationService.getBullJobId(jobDxid)
    expect(bullJobId).to.equal('sync_job_status.job-1234567')
  })

  it('parses bullJob ids correctly', async () => {
    const bullJobId = 'sync_job_status.job-G9jb79Q0qp9yX9G51fykB5VP'
    const jobDxid = JobSynchronizationService.getJobDxidFromBullJobId(bullJobId)
    expect(jobDxid).to.equal('job-G9jb79Q0qp9yX9G51fykB5VP')
  })
})
