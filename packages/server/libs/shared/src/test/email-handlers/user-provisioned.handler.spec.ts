import { expect } from 'chai'
import { stub } from 'sinon'
import { UserProvisionedDTO } from '@shared/domain/email/dto/user-provisioned.dto'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { UserProvisionedHandler } from '@shared/domain/email/templates/handlers/user-provisioned.handler'
import { EmailClient } from '@shared/services/email-client'

describe('UserProvisionedHandler', () => {
  const emailClientSendEmailStub = stub()

  const emailClient = {
    sendEmail: emailClientSendEmailStub,
  } as unknown as EmailClient

  const getHandler = () => {
    return new UserProvisionedHandler(emailClient)
  }

  beforeEach(async () => {
    emailClientSendEmailStub.reset()
    emailClientSendEmailStub.throws()
  })

  describe('#sendEmail', () => {
    it('basic', async () => {
      const input = new UserProvisionedDTO()
      input.firstName = 'Pes'
      input.username = 'pochcalström'
      input.email = 'test@email.com'

      emailClientSendEmailStub.reset()

      const handler = getHandler()
      await handler.sendEmail(input)

      expect(emailClientSendEmailStub.calledOnce).to.eq(true)
      expect(emailClientSendEmailStub.firstCall.firstArg.emailType).to.eq(EMAIL_TYPES.userProvisioned)
      expect(emailClientSendEmailStub.firstCall.firstArg.subject).to.eq(`Welcome to precisionFDA, ${input.firstName}!`)
      expect(emailClientSendEmailStub.firstCall.firstArg.to).to.eq(input.email)
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(
        `Welcome to precisionFDA, ${input.firstName}!`,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(
        `Your username for precisionFDA: <strong>${input.username}</strong></div>`,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(
        `Your email address used for this account: <strong><a href="mailto:${input.email}"`,
      )
    })
  })
})
