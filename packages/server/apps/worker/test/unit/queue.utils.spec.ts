import { expect } from 'chai'
import { isJobOrphaned } from '@shared/queue/queue.utils'
import { generate } from '@shared/test'


describe('queue.utils', () => {
  context('isJobOrphaned()', () => {
    it('should return false when next is in the future', () => {
      const jobInfo = generate.bullQueueRepeatable.syncJobStatus('job-1')
      const result = isJobOrphaned(jobInfo)
      expect(result).to.equal(false)
    })

    it('should return true when next is in the past', () => {
      const jobInfo = generate.bullQueueRepeatable.syncJobStatusOrphaned('job-2')
      const result = isJobOrphaned(jobInfo)
      expect(result).to.equal(true)
    })
  })
})
