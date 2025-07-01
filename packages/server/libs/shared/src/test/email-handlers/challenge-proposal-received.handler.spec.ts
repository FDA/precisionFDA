import { ChallengeProposalReceivedHandler } from '@shared/domain/email/templates/handlers/challenge-proposal-received.handler'
import { stub } from 'sinon'
import { expect } from 'chai'
import { config } from '@shared/config'
import { EmailClient } from '@shared/services/email-client'
import { ChallengeProposalInputDTO } from '@shared/domain/email/dto/challenge-proposal.dto'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'

describe('ChallengeProposalReceivedHandler', () => {
  const emailClientSendEmailStub = stub()

  const emailClient = {
    sendEmail: emailClientSendEmailStub,
  } as unknown as EmailClient

  const getHandler = () => {
    return new ChallengeProposalReceivedHandler(emailClient)
  }

  beforeEach(async () => {
    emailClientSendEmailStub.reset()
    emailClientSendEmailStub.throws()
  })

  describe('#sendEmail', () => {
    it('basic', async () => {
      const input = new ChallengeProposalInputDTO()
      input.name = 'test-name'
      input.email = 'test-email'
      input.organisation = 'test-organisation'
      input.specific_question = 'test-specific-question'
      input.specific_question_text = 'test-specific-question-text'
      input.data_details = 'test-data-details'
      input.data_details_text = 'test-data-details-text'
      emailClientSendEmailStub.reset()
      const handler = getHandler()

      await handler.sendEmail(input)

      expect(emailClientSendEmailStub.calledOnce).to.be.true()
      expect(emailClientSendEmailStub.firstCall.args[0].emailType).to.equal(
        EMAIL_TYPES.challengeProposalReceived,
      )
      expect(emailClientSendEmailStub.firstCall.args[0].to).to.deep.equal(
        config.challengeProposalRecipients[0],
      )
      expect(emailClientSendEmailStub.firstCall.args[0].subject).to.deep.equal(
        `${process.env.NODE_ENV} New challenge proposal received from test-name (test-email)`,
      )
      expect(emailClientSendEmailStub.firstCall.args[0].body).to.contain(
        'New challenge proposal received',
      )
      expect(emailClientSendEmailStub.firstCall.args[0].body).to.contain('test-name')
      expect(emailClientSendEmailStub.firstCall.args[0].body).to.contain('test-email')
      expect(emailClientSendEmailStub.firstCall.args[0].body).to.contain('test-organisation')
      expect(emailClientSendEmailStub.firstCall.args[0].body).to.contain('test-specific-question')
      expect(emailClientSendEmailStub.firstCall.args[0].body).to.contain(
        'test-specific-question-text',
      )
      expect(emailClientSendEmailStub.firstCall.args[0].body).to.contain('test-data-details')
      expect(emailClientSendEmailStub.firstCall.args[0].body).to.contain('test-data-details-text')
    })
  })
})
