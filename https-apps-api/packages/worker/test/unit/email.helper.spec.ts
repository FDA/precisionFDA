import { expect } from 'chai'
import { getBullJobIdForEmailOperation } from 'shared/src/domain/email/email.helper'
import { EMAIL_TYPES } from 'shared/src/domain/email/email.config'

describe('email.helper', () => {
  context('getBullJobIdForEmailOperation()', () => {
    it('should return a nice id', () => {
      const bullJobId = getBullJobIdForEmailOperation(EMAIL_TYPES.challengeOpened)
      console.log(bullJobId)
      expect(bullJobId).to.be.a('string').and.satisfy(s => s.startsWith('send_email.challengeOpened.'))

      const bullJobId2 = getBullJobIdForEmailOperation(EMAIL_TYPES.challengeOpened)
      expect(bullJobId2).to.be.a('string').and.satisfy(s => s.startsWith('send_email.challengeOpened.'))
      expect(bullJobId).to.not.equal(bullJobId2)
    })

    it('should return a nice id with custom suffix', () => {
      const jobId = 'job-12345'
      const bullJobId = getBullJobIdForEmailOperation(EMAIL_TYPES.jobTerminationWarning, jobId)
      expect(bullJobId).to.equal('send_email.jobTerminationWarning.job-12345')

      const bullJobId2 = getBullJobIdForEmailOperation(EMAIL_TYPES.jobTerminationWarning, jobId)
      expect(bullJobId).to.equal(bullJobId2)
    })
  })
})
