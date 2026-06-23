import { expect } from 'chai'
import { stub } from 'sinon'
import { config } from '@shared/config'
import { ChallengeProposalInputDTO } from '@shared/domain/email/dto/challenge-proposal-input.dto'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { ChallengeProposalReceivedHandler } from '@shared/domain/email/templates/handlers/challenge-proposal-received.handler'
import { EmailClient } from '@shared/services/email-client'

describe('ChallengeProposalReceivedHandler', () => {
  const emailClientSendEmailStub = stub()

  const emailClient = {
    sendEmail: emailClientSendEmailStub,
  } as unknown as EmailClient

  const getHandler = (): ChallengeProposalReceivedHandler => {
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
      input.specificQuestion = true
      input.specificQuestionText = 'test-specific-question-text'
      input.dataDetails = true
      input.dataDetailsText = 'test-data-details-text'
      emailClientSendEmailStub.reset()
      const handler = getHandler()

      await handler.sendEmail(input)

      expect(emailClientSendEmailStub.calledOnce).to.be.true()
      expect(emailClientSendEmailStub.firstCall.args[0].emailType).to.equal(EMAIL_TYPES.challengeProposalReceived)
      expect(emailClientSendEmailStub.firstCall.args[0].to).to.deep.equal(config.challengeProposalRecipients[0])
      expect(emailClientSendEmailStub.firstCall.args[0].subject).to.deep.equal(
        `${process.env.NODE_ENV} New challenge proposal received from test-name (test-email)`,
      )
      expect(emailClientSendEmailStub.firstCall.args[0].body).to.contain('New challenge proposal received')
      expect(emailClientSendEmailStub.firstCall.args[0].body).to.contain('test-name')
      expect(emailClientSendEmailStub.firstCall.args[0].body).to.contain('test-email')
      expect(emailClientSendEmailStub.firstCall.args[0].body).to.contain('test-organisation')
      expect(emailClientSendEmailStub.firstCall.args[0].body).to.contain('Yes')
      expect(emailClientSendEmailStub.firstCall.args[0].body).to.contain('test-specific-question-text')
      expect(emailClientSendEmailStub.firstCall.args[0].body).to.contain('test-data-details-text')
    })

    it('omits detail blocks when questions are answered No', async () => {
      const input = new ChallengeProposalInputDTO()
      input.name = 'test-name'
      input.email = 'test-email'
      input.organisation = 'test-organisation'
      input.specificQuestion = false
      input.specificQuestionText = ''
      input.dataDetails = false
      input.dataDetailsText = ''
      emailClientSendEmailStub.reset()
      const handler = getHandler()

      await handler.sendEmail(input)

      expect(emailClientSendEmailStub.calledOnce).to.be.true()
      const body: string = emailClientSendEmailStub.firstCall.args[0].body
      expect(body).to.contain('No')
      expect(body).not.to.contain('Please provide details:')
      expect(body).not.to.contain('Please provide details about the data')
    })
  })
})
